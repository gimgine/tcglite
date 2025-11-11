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
    // 1) Get all collections, sorted oldest → newest
    const collections = (await pb.collection(Collections.Collections).getFullList()).sort(
      (a, b) => new Date(a.purchased || 0).getTime() - new Date(b.purchased || 0).getTime()
    );

    // 2) Get all order items (expand order for orderDate)
    const orderItems = await pb.collection<OrderItemsResponse<{ order: OrdersRecord }>>(Collections.OrderItems).getFullList({ expand: 'order' });

    // 3) Build product → [{ qty, orderDate }]
    const soldByProduct = new Map<string, { qty: number; orderDate: string }[]>();
    for (const oi of orderItems) {
      const productId = oi.product;
      const orderDate = oi.expand?.order?.orderDate;
      const qty = oi.quantity;
      if (!productId || !orderDate || qty <= 0) continue;

      const arr = soldByProduct.get(productId) ?? [];
      arr.push({ qty, orderDate });
      soldByProduct.set(productId, arr);
    }

    // 4) Sort each product’s sales by order date
    for (const arr of soldByProduct.values()) {
      arr.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
    }

    const batch = pb.createBatch();
    let updatedCount = 0;
    let totalAllocated = 0;

    // 5) Process collections oldest → newest
    for (const collection of collections) {
      const collectionDate = new Date(collection.purchased || 0);
      const collectionItems = await pb.collection(Collections.CollectionItems).getFullList({ filter: `collection="${collection.id}"` });

      let update: null | { id: string; qtySold: number } = null;
      for (const item of collectionItems) {
        const cap = item.qtyAcquired ?? 0;
        if (item.qtySold > 0) {
          update = { id: item.id, qtySold: 0 };
        }

        if (!item.product || cap <= 0) continue;

        const sales = soldByProduct.get(item.product);
        if (!sales || sales.length === 0) continue;

        // Filter only sales after collection’s purchase date
        const validSales = sales.filter((s) => new Date(s.orderDate) >= collectionDate);
        const availableQty = validSales.reduce((sum, s) => sum + s.qty, 0);
        if (availableQty <= 0) continue;

        const allocate = Math.min(cap, availableQty);
        if (allocate <= 0) continue;

        // Always overwrite qtySold (reset + new value)
        update = { id: item.id, qtySold: allocate };

        // Consume from pool
        let toConsume = allocate;
        while (toConsume > 0 && sales.length > 0) {
          const sale = sales[0];
          if (sale.qty <= toConsume) {
            toConsume -= sale.qty;
            sales.shift();
          } else {
            sale.qty -= toConsume;
            toConsume = 0;
          }
        }

        updatedCount++;
        totalAllocated += allocate;
      }

      if (update) {
        batch.collection(Collections.CollectionItems).update(update.id, { qtySold: update.qtySold });
      }
    }

    if (updatedCount > 0) {
      await batch.send();
    }

    return { updatedCount, totalAllocated };
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
