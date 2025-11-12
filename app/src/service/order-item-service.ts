import type { OrderItemRequest } from '@/types';
import { Collections, type OrderItemsRecord, type ProductsRecord } from '@/types/pocketbase-types';
import { parsePullSheetCsv, type PullSheetCsv } from '@/util/csv-parse';
import { chunkArray } from '@/util/functions';
import pb from '@/util/pocketbase';
import { ProductService } from './product-service';

export class OrderItemService {
  productService = new ProductService();

  create = async (config: { file?: File; cards?: PullSheetCsv[] }) => {
    if (!pb.authStore.isValid) return;
    const { file, cards } = config;
    if ((!file && !cards) || (file && cards)) return;

    const csvData = config.file ? await parsePullSheetCsv(config.file) : config.cards!;

    const products = await this.productService.getProductsForTcgPlayerIds(csvData.map((c) => c.SkuId));

    if (products.length !== csvData.length) {
      const productIds = new Set(products.map((p) => p.tcgPlayerId));
      const missingProducts = csvData.filter((c) => !productIds.has(c.SkuId));

      console.error(
        `Missing ${missingProducts.length} products:`,
        missingProducts.map((p) => ({
          name: p['Product Name'] ?? '(unknown name)',
          number: p.Number,
          set: p.Set
        }))
      );

      throw new Error(
        `${csvData.length - products.length} products were not found for the submitted order items. Please update your product list in settings.`
      );
    }

    const cardRequests = this.createRequestsFromCsv(csvData, products);
    const orderIds = Array.from(new Set(cardRequests.map((c) => c.order))).filter(Boolean);
    const orderIdChunks = chunkArray(orderIds, 65); // maximum query filter size is 3500 chars
    const existingItemsForOrder: OrderItemsRecord[] = [];
    for (const chunk of orderIdChunks) {
      const filter = chunk.map((id) => `order="${id}"`).join(' || ');
      const chunkRes = await pb.collection(Collections.OrderItems).getFullList({ filter });
      existingItemsForOrder.push(...chunkRes);
    }

    const existingTcgPlayerIds = new Set(existingItemsForOrder.map((item) => products.find((product) => product.id === item.product)?.tcgPlayerId));

    const newCardRequests = cardRequests.filter((c) => {
      return !existingTcgPlayerIds.has(c.tcgPlayerId);
    });

    if (!newCardRequests.length) {
      throw new Error('No new cards were found in the CSV.');
    }

    const batch = pb.createBatch();

    newCardRequests.forEach((card) => {
      batch.collection(Collections.OrderItems).create(card);
    });

    await batch.send();
  };

  createRequestsFromCsv = (csv: PullSheetCsv[], products: ProductsRecord[]) => {
    const cardRequests: OrderItemRequest[] = [];

    const productsForPullSheet: Record<number, ProductsRecord> = Object.fromEntries(
      products.filter((p): p is ProductsRecord & { tcgPlayerId: number } => !!p.tcgPlayerId).map((p) => [p.tcgPlayerId, p])
    );

    for (const row of csv) {
      const orders = row['Order Quantity'].split('|').map((o) => {
        const [orderNumber, quantity] = o.trim().split(':');
        return { orderNumber, quantity };
      });

      for (const order of orders) {
        for (let i = 0; i < Number(order.quantity); i++) {
          const request: OrderItemRequest = {
            order: order.orderNumber,
            product: productsForPullSheet[row.SkuId].id,
            quantity: 1,
            store: pb.authStore.record?.store,
            tcgPlayerId: row.SkuId
          };
          cardRequests.push(request);
        }
      }
    }

    return cardRequests;
  };
}
