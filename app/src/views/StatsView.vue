<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="dark:border-surface-700 dark:bg-surface-900 col-span-12 rounded-md border border-gray-200 bg-white p-4 shadow md:col-span-6">
      <stat-chart header="Order History" y-label="# of Orders" :data-getter="orderDataGetter" />
    </div>
    <div class="dark:border-surface-700 dark:bg-surface-900 col-span-12 rounded-md border border-gray-200 bg-white p-4 shadow md:col-span-6">
      <stat-chart header="Profit" y-label="Profit ($)" :data-getter="profitDataGetter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import StatChart from '@/components/StatChart.vue';
import { useOrderStore } from '@/store/order-store';
import dayjs, { type Dayjs } from 'dayjs';

// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------
const orderStore = useOrderStore();

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const orderDataGetter = (start: Dayjs, end: Dayjs, diff: number) => {
  return orderStore.orders
    .map((o) => dayjs(o.orderDate).startOf('day'))
    .filter((d) => !d.isBefore(start) && !d.isAfter(end))
    .reduce((acc, d) => {
      const diffInDays = end.diff(d, 'day');
      acc[diff - diffInDays - 1] += 1;
      return acc;
    }, new Array(diff).fill(0));
};

const profitDataGetter = (start: Dayjs, end: Dayjs, diff: number) => {
  return orderStore.orders
    .filter((o) => !dayjs(o.orderDate).isBefore(start) && !dayjs(o.orderDate).isAfter(end))
    .reduce((acc, o) => {
      const d = dayjs(o.orderDate);
      const diffInDays = end.diff(d, 'day');
      acc[diff - diffInDays - 1] += o.profit;
      return acc;
    }, new Array(diff).fill(0));
};

// Lifecycle Hooks --------------------------------------------------------------------
</script>
