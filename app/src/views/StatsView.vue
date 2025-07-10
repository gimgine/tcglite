<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 rounded-md bg-white p-4 shadow md:col-span-6">
      <order-history-chart />
    </div>
    <div class="col-span-12 rounded-md bg-white p-4 shadow md:col-span-6">
      <profit-chart />
    </div>
  </div>
</template>

<script setup lang="ts">
import OrderHistoryChart from '@/components/OrderHistoryChart.vue';
import ProfitChart from '@/components/ProfitChart.vue';

// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------

// Lifecycle Hooks --------------------------------------------------------------------
</script>
