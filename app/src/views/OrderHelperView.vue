<template>
  <div class="flex w-full flex-grow flex-col items-center justify-center">
    <div :class="`relative w-full ${$router.currentRoute.value.name === 'pullSheet' ? 'max-w-3xl' : 'max-w-2xl'}`">
      <div class="absolute -top-10 right-0">
        <Button icon="pi pi-undo" variant="text" rounded size="small" severity="secondary" @click="handleReset" />
      </div>

      <div class="rounded-md bg-white p-8 shadow">
        <span class="text-3xl font-semibold">Order Helper</span>

        <router-view v-slot="{ Component }">
          <component
            :is="Component"
            :pull-sheet
            :shipping-export
            @pull-sheet-upload="pullSheet = $event"
            @shipping-export-upload="shippingExport = $event"
            @next="handleNext"
          />
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { type PullSheetCsv, type ShippingCsv } from '@/util/csv-parse';
import { Button } from 'primevue';
import { ref } from 'vue';

// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------
const pullSheet = ref<PullSheetCsv[]>([]);
const shippingExport = ref<ShippingCsv[]>([]);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------

const handleNext = () => {
  const currentRouteName = router.currentRoute.value.name;
  if (currentRouteName === 'upload') {
    router.push({ name: 'pullSheet' });
  } else if (currentRouteName === 'pullSheet') {
    router.push({ name: 'shipping' });
  }
};

const handleReset = () => {
  router.push({ name: 'upload' });
};

// Lifecycle Hooks --------------------------------------------------------------------
</script>
