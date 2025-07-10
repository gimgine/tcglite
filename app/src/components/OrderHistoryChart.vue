<template>
  <div class="mb-4 flex items-center justify-between">
    <span class="text-xl font-bold">Order History</span>
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
        text: '# of Orders'
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

const chartData = computed<ChartData>(() => {
  if (dateRange.value.length !== 2 || !dateRange.value[0] || !dateRange.value[1]) return;
  const start = dayjs(dateRange.value[0]).startOf('day');
  const end = dayjs(dateRange.value[1]).endOf('day');
  const diff = end.diff(start, 'day') + 1;

  const data = orderStore.orders
    .map((o) => dayjs(o.orderDate).startOf('day'))
    .filter((d) => !d.isBefore(start) && !d.isAfter(end))
    .reduce((acc, d) => {
      const diffInDays = end.diff(d, 'day');
      acc[diff - diffInDays - 1] += 1;
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
const dateRange = ref([dayjs().subtract(6, 'day').toDate(), new Date()]);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------

// Lifecycle Hooks --------------------------------------------------------------------
</script>
