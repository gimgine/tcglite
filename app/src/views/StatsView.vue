<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 rounded-md bg-white p-4 shadow md:col-span-6">
      <div class="mb-4 flex items-center justify-between">
        <span class="text-xl font-bold">Order History</span>
        <Select v-model="selectedTime" :options="timeOptions" class="w-32" />
      </div>
      <chart type="line" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderStore } from '@/store/order-store';
import { type ChartData, type ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { computed, ref } from 'vue';
import { Select } from 'primevue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------
const chartOptions: ChartOptions = {
  scales: {
    y: {
      title: {
        display: true,
        text: '# Orders'
      },
      beginAtZero: true
    },
    x: {
      title: {
        display: true,
        text: 'Day'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};
const timeOptions = ['Week', 'Month', 'Year', 'All'];

// Reactive Variables -----------------------------------------------------------------
const orderStore = useOrderStore();

const chartData = computed<ChartData>(() => {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  const data = orderStore.orders
    .map((o) => new Date(o.orderDate))
    .filter((d) => d >= weekAgo)
    .reduce((acc, d) => {
      const diffInMs = now.getTime() - d.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      acc[6 - diffInDays]++;
      return acc;
    }, new Array(7).fill(0));
  const labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  return {
    labels,
    datasets: [
      {
        data
      }
    ]
  };
});
const selectedTime = ref('Week');

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------

// Lifecycle Hooks --------------------------------------------------------------------
</script>
