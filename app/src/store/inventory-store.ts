import { Collections, type InventoryItemsRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useInventoryStore = defineStore('inventoryStore', () => {
  const inventory = ref<InventoryItemsRecord[]>([]);

  const refresh = async () => {
    inventory.value = await pb.collection(Collections.InventoryItems).getFullList();
  };

  return { inventory, refresh };
});
