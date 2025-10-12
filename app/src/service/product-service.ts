import { Collections, type ProductsRecord } from '@/types/pocketbase-types';
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
}
