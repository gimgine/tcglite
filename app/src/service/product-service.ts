import type { Result } from '@/types';
import { Collections, type ProductsRecord } from '@/types/pocketbase-types';
import { type PricingCsv } from '@/util/csv-parse';
import { chunkArray } from '@/util/functions';
import pb from '@/util/pocketbase';

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
    return pb
      .send('/products/sync', { method: 'POST', body: { pricingCsv } })
      .then((res) => {
        return { success: true, message: res.message };
      })
      .catch((err) => {
        return { success: false, message: err.message };
      });
  };
}
