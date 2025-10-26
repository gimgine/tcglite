import pb from '@/util/pocketbase';
import { OrderItemService } from './order-item-service';
import { ProductService } from './product-service';
import {
  Collections,
  InventoryItemsSourceOptions,
  type InventoryItemsRecord,
  type OrderItemsResponse,
  type ProductsRecord
} from '@/types/pocketbase-types';
import type { PricingCsv } from '@/util/csv-parse';
import { OrderService } from './order-service';
import type { Result } from '@/types';

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

      if (!qtyAcquired) continue;

      const newItem = {
        store: pb.authStore.record?.store,
        product: productIdMap[price['TCGplayer Id']],
        qtyAcquired: qtyAcquired,
        qtySold: soldCardsQuantityMap[price['TCGplayer Id']],
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
}
