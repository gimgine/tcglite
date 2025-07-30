<template>
  <div class="flex w-full flex-grow flex-col items-center justify-center">
    <div :class="`relative w-full ${$router.currentRoute.value.name === 'pullSheet' ? 'max-w-4xl' : 'max-w-2xl'}`">
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
            @back="handleBack"
          />
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { parsePullSheetCsv, parseShippingCsv, type PullSheetCsv, type ShippingCsv } from '@/util/csv-parse';
import { Button } from 'primevue';
import { onMounted, ref } from 'vue';

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

const handleBack = () => {
  const currentRouteName = router.currentRoute.value.name;

  if (currentRouteName === 'pullSheet') {
    router.push({ name: 'upload' });
  } else if (currentRouteName === 'shipping') {
    console.log(pullSheet.value);
    if (!pullSheet.value.length) {
      router.push({ name: 'upload' });
    } else {
      router.push({ name: 'pullSheet' });
    }
  }
};

const handleReset = () => {
  router.push({ name: 'upload' });
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  // load test data
  if (import.meta.env.DEV) {
    const shipResponse = await fetch('/TCGplayer_ShippingExport.csv');
    const pullResponse = await fetch('/TCGplayer_PullSheet.csv');

    const shipBlob = await shipResponse.blob();
    const pullBlob = await pullResponse.blob();

    const shipFile = new File([shipBlob], 'ShippingExport.csv', { type: shipBlob.type });
    const pullFile = new File([pullBlob], 'PullSheet.csv', { type: pullBlob.type });

    shippingExport.value = await parseShippingCsv(shipFile);
    pullSheet.value = await parsePullSheetCsv(pullFile);
  }
});
</script>
