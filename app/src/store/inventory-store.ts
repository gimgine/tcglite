import { Collections, type InventoryItemsRecord, type InventoryItemsResponse, type ProductsRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type InventoryItemsExpandProduct = InventoryItemsResponse<{ product: ProductsRecord }>;

export const useInventoryStore = defineStore('inventoryStore', () => {
  const inventory = ref<InventoryItemsExpandProduct[]>();

  const refresh = async () => {
    inventory.value = await pb.collection<InventoryItemsExpandProduct>(Collections.InventoryItems).getFullList({ expand: 'product' });
  };

  return { inventory, refresh };
});
