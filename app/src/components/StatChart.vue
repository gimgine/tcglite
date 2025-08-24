<template>
  <div class="flex items-center gap-2">
    <span class="mr-auto text-xl font-bold">{{ header }}</span>
    <Message size="small" severity="secondary">Total: {{ total }}</Message>
    <Message size="small" severity="secondary"> Average: {{ (total / dayjs(dateRange[1]).diff(dateRange[0], 'days')).toFixed(2) }} </Message>
  </div>
  <div class="my-2 flex items-center gap-2">
    <Button size="small" @click="setMonth">Month</Button>
    <Button size="small" class="mr-auto" @click="setWeek"> Week </Button>
    <DatePicker v-model="dateRange" size="small" selection-mode="range" :manual-input="false" :max-date="new Date()" class="w-48" />
  </div>
  <Chart type="line" :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { type ChartData, type ChartOptions } from 'chart.js';
import Chart from 'primevue/chart';
import { computed, ref } from 'vue';
import { DatePicker, Button, Message } from 'primevue';
import dayjs, { type Dayjs } from 'dayjs';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ dataGetter: (start: Dayjs, end: Dayjs, diff: number) => number[]; yLabel: string; header: string }>();

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------
const chartOptions = computed<ChartOptions>(() => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  return {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      },
      y: {
        title: {
          display: true,
          text: props.yLabel
        },
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };
});

// Reactive Variables -----------------------------------------------------------------
const chartData = computed<ChartData | undefined>(() => {
  if (dateRange.value.length !== 2 || !dateRange.value[0] || !dateRange.value[1]) return;
  const start = dayjs(dateRange.value[0]).startOf('day');
  const end = dayjs(dateRange.value[1]).endOf('day');
  const diff = end.diff(start, 'day') + 1;

  const data = props.dataGetter(start, end, diff);

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
const total = computed<number>(() => +((chartData.value?.datasets[0].data as number[])?.reduce((acc, e) => acc + e, 0).toFixed(2) ?? 0));
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
