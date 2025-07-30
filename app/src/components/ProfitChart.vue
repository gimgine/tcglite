<template>
  <div class="mb-4 flex items-center gap-2">
    <span class="text-xl font-bold">Profit</span>
    <div class="mr-auto rounded border border-gray-200 bg-gray-100 px-2 py-1 text-sm">Total: {{ total }}</div>
    <date-picker v-model="dateRange" selection-mode="range" :manual-input="false" :max-date="new Date()" class="w-54" />
  </div>
  <chart type="line" :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { useOrderStore } from '@/store/order-store';
import { type ChartData, type ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { computed, ref } from 'vue';
import { DatePicker } from 'primevue';
import dayjs from 'dayjs';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------
const chartOptions: ChartOptions = {
  scales: {
    y: {
      title: {
        display: true,
        text: 'Profit ($)'
      },
      beginAtZero: true
    },
    x: {
      title: {
        display: true,
        text: 'Date'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

// Reactive Variables -----------------------------------------------------------------
const orderStore = useOrderStore();

const chartData = computed<ChartData | undefined>(() => {
  if (dateRange.value.length !== 2 || !dateRange.value[0] || !dateRange.value[1]) return;
  const start = dayjs(dateRange.value[0]).startOf('day');
  const end = dayjs(dateRange.value[1]).endOf('day');
  const diff = end.diff(start, 'day') + 1;

  const data = orderStore.orders
    .filter((o) => !dayjs(o.orderDate).isBefore(start) && !dayjs(o.orderDate).isAfter(end))
    .reduce((acc, o) => {
      const d = dayjs(o.orderDate);
      const diffInDays = end.diff(d, 'day');
      acc[diff - diffInDays - 1] += o.profit;
      return acc;
    }, new Array(diff).fill(0));

  const labels = Array.from({ length: diff }, (_, i) => start.add(i, 'day').format('M/D'));
  return {
    labels,
    datasets: [
      {
        data
      }
    ]
  };
});
const total = computed(() => (chartData.value?.datasets[0].data as number[])?.reduce((acc, e) => acc + e, 0).toFixed(2) ?? 0);
const dateRange = ref([dayjs().subtract(6, 'day').toDate(), new Date()]);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------

// Lifecycle Hooks --------------------------------------------------------------------
</script>
