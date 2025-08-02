<template>
  <div class="flex items-center gap-2">
    <span class="mr-auto text-xl font-bold">Order History</span>
    <div class="rounded border border-gray-200 bg-gray-100 px-2 py-1 text-sm">Total: {{ total }}</div>
    <div class="rounded border border-gray-200 bg-gray-100 px-2 py-1 text-sm">
      Average: {{ (total / dayjs(dateRange[1]).diff(dateRange[0], 'days')).toFixed(2) }}
    </div>
  </div>
  <div class="my-2 flex items-center gap-2">
    <Button size="small" @click="setMonth">Month</Button>
    <Button size="small" class="mr-auto" @click="setWeek"> Week </Button>
    <date-picker v-model="dateRange" size="small" selection-mode="range" :manual-input="false" :max-date="new Date()" class="w-48" />
  </div>
  <chart type="line" :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { useOrderStore } from '@/store/order-store';
import { type ChartData, type ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { computed, ref } from 'vue';
import { DatePicker, Button } from 'primevue';
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

const chartData = computed<ChartData | undefined>(() => {
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
const total = computed(() => (chartData.value?.datasets[0].data as number[])?.reduce((acc, e) => acc + e, 0) ?? 0);
const dateRange = ref([dayjs().subtract(6, 'day').toDate(), new Date()]);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const setWeek = () => {
  dateRange.value = [dayjs(dateRange.value[1]).subtract(6, 'day').toDate(), dateRange.value[1]];
};

const setMonth = () => {
  dateRange.value = [dayjs(dateRange.value[1]).subtract(30, 'day').toDate(), dateRange.value[1]];
};

// Lifecycle Hooks --------------------------------------------------------------------
</script>
