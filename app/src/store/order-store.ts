import { Collections, type OrdersRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOrderStore = defineStore('orderStore', () => {
  const orders = ref<OrdersRecord[]>([]);

  const refresh = async () => {
    orders.value = await pb.collection(Collections.Orders).getFullList();
  };

  return { orders, refresh };
});
