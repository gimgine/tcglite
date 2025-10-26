import type { Result } from '@/types';
import { Collections, type ProductsRecord } from '@/types/pocketbase-types';
import { parsePricingCsv, type PricingCsv } from '@/util/csv-parse';
import { chunkArray } from '@/util/functions';
import pb from '@/util/pocketbase';
import type { FileUploadSelectEvent } from 'primevue/fileupload';

export class ProductService {
  getProductsForTcgPlayerIds = async (tcgPlayerIds: number[]) => {
    // chunk up due to max query size, could be bigger maybe
    const tcgPlayerIdChunks = chunkArray(tcgPlayerIds, 75);

    // fetch all products that match the provided tcgPlayerIds
    const allProducts: ProductsRecord[] = [];
    for (const chunk of tcgPlayerIdChunks) {
      const filter = chunk.map((id) => `tcgPlayerId="${id}"`).join(' || ');
      const chunkRes = await pb.collection(Collections.Products).getFullList({ filter });
      allProducts.push(...chunkRes);
    }

    return allProducts;
  };

  syncProducts = async (pricingCsv: PricingCsv[]): Promise<Result> => {
    try {
      const products = await pb.collection(Collections.Products).getFullList();

      const productsToCreate: PricingCsv[] = [];
      const productsToUpdate: ProductsRecord[] = [];

      // update market price for exising products and identify which pricing records are new
      for (const pricing of pricingCsv) {
        const possibleProductForPricing = products.find((p) => pricing['TCGplayer Id'] === p.tcgPlayerId);
        if (possibleProductForPricing) {
          if (possibleProductForPricing.marketPrice !== (pricing['TCG Market Price'] ?? 0)) {
            possibleProductForPricing.marketPrice = pricing['TCG Market Price'];
            possibleProductForPricing.marketPriceUpdated = new Date().toUTCString();
            productsToUpdate.push(possibleProductForPricing);
          }
        } else {
          productsToCreate.push(pricing);
        }
      }

      if (!productsToCreate.length && !productsToUpdate.length) {
        return { success: true, message: 'No updates were needed.' };
      }

      // create new products
      const batch = pb.createBatch();

      productsToCreate.forEach((product) => {
        batch.collection(Collections.Products).create({
          store: pb.authStore.record?.store,
          productLine: product['Product Line'],
          name: product['Product Name'],
          condition: product['Condition'],
          set: product['Set Name'],
          number: product['Number'],
          rarity: product.Rarity,
          language: product.Condition.split(' - ')[1] ?? 'English', // ex. 'Near Mint - Japanese'
          tcgPlayerId: product['TCGplayer Id'],
          marketPrice: product['TCG Market Price'],
          marketPriceUpdated: new Date().toUTCString()
        });
      });

      productsToUpdate.forEach((product) => {
        batch.collection(Collections.Products).update(product.id, product);
      });

      await batch.send();
      return { success: true, message: 'Store product list successfully synchronized.' };
    } catch (err) {
      console.error('Error syncing products:', err);
      return { success: false, message: 'Unknown error occurred' };
    }
  };
}
