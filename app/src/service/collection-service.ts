import { Collections, type OrderItemsResponse, type OrdersRecord } from '@/types/pocketbase-types';
import { parseListPullSheetCsv, parsePricingCsv, type ListPullSheetCsv, type PricingCsv } from '@/util/csv-parse';
import pb from '@/util/pocketbase';
import { OrderItemService } from './order-item-service';
import { OrderService } from './order-service';
import { ProductService } from './product-service';

interface NewInventorySeed {
  productId: string;
  quantity: number;
  marketPrice: number;
}

type OrderWithExpand = OrderItemsResponse<{ order: OrdersRecord }>;

export class CollectionService {
  orderService = new OrderService();
  orderItemService = new OrderItemService();
  productService = new ProductService();

  addToCollection = async (collectionId: string, listingDate: string, listPullSheetFile: File, pricingFile: File) => {
    const listPullSheetCsvData = await parseListPullSheetCsv(listPullSheetFile);
    const pricingCsvData = await parsePricingCsv(pricingFile);

    const seeds = await this.getCollectionItemSeeds(listPullSheetCsvData, pricingCsvData);

    const batch = pb.createBatch();

    for (const seed of seeds) {
      batch.collection(Collections.CollectionItems).create({
        collection: collectionId,
        product: seed.productId,
        store: pb.authStore.record?.store,
        marketPriceAtImport: seed.marketPrice,
        qtyAcquired: seed.quantity,
        qtySold: 0,
        unitCogs: 0,
        listed: listingDate
      });
    }

    await batch.send();
  };

  updateCogs = async (collectionId: string) => {
    const collectionStats = await pb.collection(Collections.CollectionStats).getOne(collectionId);
    const collectionItems = await pb.collection(Collections.CollectionItems).getFullList({ filter: `collection="${collectionId}"` });

    const purchaseRate = (collectionStats.purchaseCost as number) / (collectionStats.totalQtyAcquired as number);

    const batch = pb.createBatch();

    for (const item of collectionItems) {
      batch.collection(Collections.CollectionItems).update(item.id, { unitCogs: item.marketPriceAtImport * purchaseRate });
    }

    await batch.send();
  };

  scanForSoldCards = async () => {
    const collections = await pb.collection(Collections.Collections).getFullList();

    for (const id of collections) {
      await this.scanForSoldCardsForCollection(id.id);
    }
  };

  scanForSoldCardsForCollection = async (
    collectionId: string,
    opts?: {
      respectListedDate?: boolean; // default true
    }
  ) => {
    const respectListedDate = opts?.respectListedDate ?? true;

    // 1) Load the collection & its items
    const collection = await pb.collection(Collections.Collections).getOne(collectionId);
    const collectionPurchasedISO = collection.purchased;
    if (!collectionPurchasedISO) {
      throw new Error(`Collection ${collectionId} is missing 'purchased' date.`);
    }
    const collectionPurchased = new Date(collectionPurchasedISO);

    const collectionItems = await pb.collection(Collections.CollectionItems).getFullList({
      filter: `collection="${collectionId}"`
    });

    // Deterministic item order (optional): earliest listed first, then by id
    collectionItems.sort((a, b) => {
      const aTime = a.listed ? new Date(a.listed).getTime() : 0;
      const bTime = b.listed ? new Date(b.listed).getTime() : 0;
      if (aTime !== bTime) return aTime - bTime;
      return a.id.localeCompare(b.id);
    });

    // 2) Load UNASSIGNED orderItems on/after the collection's purchase date
    //    We filter server-side: order.orderDate >= collection.purchased AND collectionItem empty
    const orderItems = await pb.collection(Collections.OrderItems).getFullList<OrderWithExpand>({
      filter: `order.orderDate >= "${collectionPurchasedISO}" && (collectionItem = null || collectionItem = "")`,
      expand: 'order',
      sort: 'order.orderDate' // oldest first
    });

    // 3) Build per-product FIFO queues of unassigned orderItems
    const queueByProduct = new Map<string, OrderWithExpand[]>();
    for (const oi of orderItems) {
      const productId = oi.product;
      const orderDate = oi.expand?.order?.orderDate;
      if (!productId || !orderDate) continue; // must have product & order.date
      const arr = queueByProduct.get(productId) ?? [];
      arr.push(oi);
      queueByProduct.set(productId, arr);
    }

    // 4) Allocate: walk each collection item, fill up to (qtyAcquired - qtySold)
    const batch = pb.createBatch();
    let itemsUpdated = 0;
    let ordersUpdated = 0;
    let totalAssigned = 0;

    for (const ci of collectionItems) {
      const cap = ci.qtyAcquired ?? 0;
      const currentSold = ci.qtySold ?? 0;
      if (!ci.product || cap <= 0 || currentSold >= cap) continue;

      const queue = queueByProduct.get(ci.product);
      if (!queue || queue.length === 0) continue;

      // Determine the earliest allowable order date for this item
      // Orders must be on/after the collection purchased date (already filtered)
      // If we also respect listed date, ensure orderDate >= ci.listed
      const listedCutoff = respectListedDate && ci.listed ? new Date(ci.listed) : collectionPurchased;

      let remaining = cap - currentSold;
      let added = 0;

      // Consume oldest orders that satisfy the listed cutoff
      // (Since queue is sorted by order.orderDate, we can skip until cutoff)
      let i = 0;
      while (remaining > 0 && i < queue.length) {
        const oi = queue[i];
        const orderDateISO = oi.expand?.order?.orderDate;
        if (!orderDateISO) {
          i++;
          continue;
        }

        const orderDate = new Date(orderDateISO);
        if (orderDate < listedCutoff) {
          // This order is too early for this item—skip it for this item,
          // but don't remove from the global queue; it might fit a different item with an earlier listed date.
          i++;
          continue;
        }

        // Assign this order to the collection item
        batch.collection(Collections.OrderItems).update(oi.id, {
          // collectionItem is a single relation now:
          collectionItem: ci.id
        });
        ordersUpdated++;
        totalAssigned++;

        // Remove it from the queue so it can't be reused
        queue.splice(i, 1);

        // Increment the item's sold count locally
        remaining -= 1;
        added += 1;
      }

      if (added > 0) {
        batch.collection(Collections.CollectionItems).update(ci.id, {
          qtySold: currentSold + added
        });
        itemsUpdated++;
      }
    }

    if (itemsUpdated > 0 || ordersUpdated > 0) {
      await batch.send();
    }

    return {
      itemsUpdated,
      ordersUpdated,
      unitsAssigned: totalAssigned
    };
  };

  getCollectionItemSeeds = async (listPullSheetCsvData: ListPullSheetCsv[], pricingCsvData: PricingCsv[]) => {
    function makeCompositeKey(productLine: string, productName: string, set: string, number: string, condition: string): string {
      return [productLine, productName, set, number, condition].join('|');
    }

    const pricingByComposite = new Map<string, PricingCsv>();
    const pricingByTcgId = new Map<number, PricingCsv>();

    for (const p of pricingCsvData) {
      const composite = makeCompositeKey(p['Product Line'], p['Product Name'], p['Set Name'], p['Number'], p['Condition']);
      pricingByComposite.set(composite, p);
      pricingByTcgId.set(p['TCGplayer Id'], p);
    }

    const qtyByTcgId = new Map<number, number>();
    const tcgIds: number[] = [];
    const missingPricingRows: Array<{ row: ListPullSheetCsv; reason: string }> = [];

    for (const row of listPullSheetCsvData) {
      const composite = makeCompositeKey(row['Product Line'], row['Product Name'], row['Set'], row['Number'], row['Condition']);

      const matched = pricingByComposite.get(composite);
      if (!matched) {
        missingPricingRows.push({ row, reason: 'No matching pricing row by composite fields.' });
        continue;
      }

      const tcgId = matched['TCGplayer Id'];
      if (typeof tcgId !== 'number' || Number.isNaN(tcgId)) {
        missingPricingRows.push({ row, reason: 'Invalid or missing TCGplayer ID in pricing row.' });
        continue;
      }

      if (!qtyByTcgId.has(tcgId)) {
        qtyByTcgId.set(tcgId, row.Quantity ?? 0);
        tcgIds.push(tcgId);
      } else {
        qtyByTcgId.set(tcgId, (qtyByTcgId.get(tcgId) ?? 0) + (row.Quantity ?? 0));
      }
    }

    const products = await this.productService.getProductsForTcgPlayerIds(tcgIds);

    const productIdByTcgId = new Map<number, string>();
    for (const prod of products) {
      if (prod.tcgPlayerId != null && prod.id) {
        productIdByTcgId.set(Number(prod.tcgPlayerId), String(prod.id));
      }
    }

    const results: NewInventorySeed[] = [];
    const missingProductsForTcgIds: number[] = [];

    for (const tcgId of qtyByTcgId.keys()) {
      const productId = productIdByTcgId.get(tcgId);
      if (!productId) {
        missingProductsForTcgIds.push(tcgId);
        continue;
      }

      const p = pricingByTcgId.get(tcgId)!;
      const marketPrice = p['TCG Market Price'];

      results.push({
        productId,
        quantity: qtyByTcgId.get(tcgId)!,
        marketPrice
      });
    }

    return results;
  };
}
