import type { Result } from '@/types';
import {
  Collections,
  InventoryItemsSourceOptions,
  type InventoryItemsRecord,
  type OrderItemsResponse,
  type ProductsRecord
} from '@/types/pocketbase-types';
import { parseListPullSheetCsv, parsePricingCsv, type ListPullSheetCsv, type PricingCsv } from '@/util/csv-parse';
import pb from '@/util/pocketbase';
import { OrderItemService } from './order-item-service';
import { OrderService } from './order-service';
import { ProductService } from './product-service';
import { chunkArray } from '@/util/functions';

interface NewInventorySeed {
  productId: string;
  quantity: number;
  marketPrice: number;
}

export class InventoryService {
  orderService = new OrderService();
  orderItemService = new OrderItemService();
  productService = new ProductService();

  initializeInventory = async (pricingCsv: PricingCsv[]): Promise<Result> => {
    const soldCards = await pb.collection<OrderItemsResponse<{ product: ProductsRecord }>>(Collections.OrderItems).getFullList({ expand: 'product' });
    const products = await pb.collection(Collections.Products).getFullList({ fields: 'id,tcgPlayerId' });

    const soldCardsQuantityMap = soldCards.reduce<Record<number, number>>((acc, item) => {
      acc[item.expand.product.tcgPlayerId] = (acc[item.expand.product.tcgPlayerId] || 0) + item.quantity;
      return acc;
    }, {});
    const productIdMap = products.reduce<Record<number, string>>((acc, product) => {
      if (product.tcgPlayerId != null) {
        acc[product.tcgPlayerId] = product.id;
      }
      return acc;
    }, {});

    const batch = pb.createBatch();

    const acquisitionDate = new Date().toUTCString();
    const averageCogs = await this.orderService.getAverageCogs();
    for (const price of pricingCsv) {
      const qtyAcquired = price['Total Quantity'] + (soldCardsQuantityMap[price['TCGplayer Id']] ?? 0);

      const newItem = {
        store: pb.authStore.record?.store,
        product: productIdMap[price['TCGplayer Id']],
        qtyAcquired: qtyAcquired ?? 0,
        qtySold: soldCardsQuantityMap[price['TCGplayer Id']] ?? 0,
        unitCogs: averageCogs,
        marketPriceAtImport: price['TCG Market Price'],
        acquired: acquisitionDate,
        source: InventoryItemsSourceOptions.auto
      };

      batch.collection(Collections.InventoryItems).create(newItem);
    }

    await batch.send();
    return { success: true, message: 'Inventory successfully initialized.' };
  };

  addToCollection = async (collection: { id: string; purchaseCost: number; purchased: string }, listPullSheetFile: File, pricingFile: File) => {
    const listPullSheetCsvData = await parseListPullSheetCsv(listPullSheetFile);
    const pricingCsvData = await parsePricingCsv(pricingFile);

    const seeds = await this.getInventorySeeds(listPullSheetCsvData, pricingCsvData);
    const totalMarketValue = seeds.reduce((sum, seed) => sum + seed.quantity * seed.marketPrice, 0);
    const purchaseRate = collection.purchaseCost / totalMarketValue;

    const inventoryItems = await this.getInventoryItemsForProducts(seeds.map((s) => s.productId));
    const autoSourceItems = inventoryItems.filter((item) => item.source === InventoryItemsSourceOptions.auto);

    const batch = pb.createBatch();

    console.log('Seeds: ', seeds.length);
    let created = 0;

    for (const seed of seeds) {
      const newQtyAcquired = Number(seed.quantity) || 0;
      if (newQtyAcquired <= 0) {
        console.log('Seed qtyAcquired is 0, skipping.');
        continue;
      }

      const inventoryItem = autoSourceItems.find((item) => item.product === seed.productId);

      let soldFromNew = 0;

      if (inventoryItem) {
        const oldQtyAcquired = Number(inventoryItem.qtyAcquired) || 0;
        const oldQtySold = Number(inventoryItem.qtySold) || 0;

        const remainingFromOld = Math.max(0, oldQtyAcquired - newQtyAcquired);
        soldFromNew = Math.max(0, oldQtySold - remainingFromOld);

        soldFromNew = Math.min(soldFromNew, newQtyAcquired);

        let updatedQtyAcquired = oldQtyAcquired - newQtyAcquired;
        let updatedQtySold = oldQtySold - soldFromNew;

        if (updatedQtyAcquired < 0) updatedQtyAcquired = 0;
        if (updatedQtySold < 0) updatedQtySold = 0;

        if (updatedQtyAcquired === 0 && updatedQtySold === 0) {
          batch.collection(Collections.InventoryItems).delete(inventoryItem.id);
        } else {
          batch.collection(Collections.InventoryItems).update(inventoryItem.id, {
            ...inventoryItem,
            qtyAcquired: updatedQtyAcquired,
            qtySold: updatedQtySold
          });
        }

        const newItem = {
          store: pb.authStore.record?.store,
          collection: collection.id,
          product: seed.productId,
          qtyAcquired: newQtyAcquired,
          qtySold: soldFromNew,
          unitCogs: seed.marketPrice * purchaseRate,
          marketPriceAtImport: seed.marketPrice,
          acquired: collection.purchased,
          source: InventoryItemsSourceOptions.manual
        };

        created++;
        batch.collection(Collections.InventoryItems).create(newItem);
      } else {
        console.log('Unable to find inventory item for seed: ', seed);
      }
    }

    await batch.send();
    console.log('Created: ', created);
  };

  getInventoryItemsForProducts = async (productIds: string[]) => {
    const chunks = chunkArray(productIds, 100);

    const allProducts: InventoryItemsRecord[] = [];
    for (const chunk of chunks) {
      const filter = chunk.map((id) => `product="${id}"`).join(' || ');
      const chunkRes = await pb.collection(Collections.InventoryItems).getFullList({ filter });
      allProducts.push(...chunkRes);
    }

    return allProducts;
  };

  getInventorySeeds = async (listPullSheetCsvData: ListPullSheetCsv[], pricingCsvData: PricingCsv[]) => {
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
