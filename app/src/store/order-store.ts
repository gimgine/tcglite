import { Collections, type OrderStatsRecord, type OrdersRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOrderStore = defineStore('orderStore', () => {
  const orders = ref<OrdersRecord[]>([]);
  const orderStats = ref<OrderStatsRecord>();
  const isOrdersLoading = ref(false);

  const refresh = async () => {
    orderStats.value = (await pb.collection(Collections.OrderStats).getFullList())[0];

    isOrdersLoading.value = true;
    orders.value = await pb.collection(Collections.Orders).getFullList({ sort: '-orderDate' });
    isOrdersLoading.value = false;
  };

  return { orders, orderStats, isOrdersLoading, refresh };
});
