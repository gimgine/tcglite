<template>
  <span class="text-xs italic">
    Press <span class="dark:bg-surface-600 rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">C</span> to focus the copy button.
  </span>
  <span class="mt-1 text-xs italic"> Use the arrow keys to navigate between shipping labels. </span>
  <span class="mt-1 mb-4 text-xs italic">
    Use <span class="dark:bg-surface-600 rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">Enter</span> or
    <span class="dark:bg-surface-600 rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">Space</span> to copy to the clipboard.
  </span>

  <div class="mr-32 text-right text-sm">
    <span
      v-show="postageRequired !== ''"
      v-tooltip.top="
        `1 oz: <= ${preferencesStore.preferences?.oneOunceCards} cards\n2 oz: <= ${preferencesStore.preferences?.twoOunceCards} cards\n3 oz: <= ${preferencesStore.preferences?.threeOunceCards} cards`
      "
      class="dark:bg-surface-600 mr-2 rounded-sm bg-gray-100 px-2 py-0.5 text-xs font-bold"
    >
      {{ postageRequired }}
    </span>
    <span
      :class="`mr-2 rounded-sm px-2 py-0.5 text-xs font-bold ${shippingMethod === 'Tracking' ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600 dark:bg-pink-600 dark:text-pink-200'}`"
    >
      {{ shippingMethod }}
    </span>
    <span>{{ `${shippingIndex + 1} of ${shippingExport.length}` }}</span>
  </div>

  <div class="relative my-2 h-full w-full">
    <div class="absolute top-1/3 left-9 flex flex-col items-center">
      <Button
        icon="pi pi-arrow-left"
        variant="text"
        rounded
        size="small"
        severity="secondary"
        :disabled="shippingIndex === 0"
        @click="handleGoLeft"
        @keyup="handleGoLeft"
      />
    </div>
    <div class="dark:bg-surface-950 dark:border-surface-800 mx-28 flex flex-col gap-4 rounded border border-gray-200 shadow">
      <div class="p-4 font-mono whitespace-pre-line">
        {{ formattedShipping }}
      </div>
    </div>
    <div class="absolute top-1/3 right-9">
      <Button
        icon="pi pi-arrow-right"
        variant="text"
        rounded
        size="small"
        severity="secondary"
        :disabled="shippingIndex === shippingExport.length - 1"
        @click="handleGoRight"
        @keyup="handleGoRight"
      />
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <Button severity="secondary" label="Back" icon="pi pi-arrow-left" icon-pos="left" @click="$emit('back')" />
    <Button ref="copyButton" class="w-fit" icon="pi pi-copy" label="Copy" severity="info" @click="copyToClipboard" />
    <Button class="w-fit" icon="pi pi-check" label="Done" :disabled="shippingIndex !== shippingExport.length - 1" @click="$emit('done')" />
  </div>
</template>

<script setup lang="ts">
import { usePreferencesStore } from '@/store/preferences-store';
import { type ShippingCsv } from '@/util/csv-parse';
import { Button, useToast } from 'primevue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ shippingExport: ShippingCsv[] }>();
defineEmits<{ back: []; done: [] }>();

// Template Refs ----------------------------------------------------------------------
const copyButton = ref();

// Variables --------------------------------------------------------------------------
const preferencesStore = usePreferencesStore();

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const shippingMethod = computed(() => {
  if (selectedShipping.value) {
    return selectedShipping.value['Value Of Products'] + selectedShipping.value['Shipping Fee Paid'] >=
      (preferencesStore.preferences?.trackingThreshold ?? 0)
      ? 'Tracking'
      : 'Envelope';
  } else {
    return '';
  }
});

const postageRequired = computed(() => {
  if (selectedShipping.value) {
    const count = selectedShipping.value['Item Count'];
    if (shippingMethod.value === 'Envelope') {
      if (count <= (preferencesStore.preferences?.oneOunceCards ?? 0)) {
        return '1 oz';
      } else if (count <= (preferencesStore.preferences?.twoOunceCards ?? 0)) {
        return '2 oz';
      } else if (count <= (preferencesStore.preferences?.threeOunceCards ?? 0)) {
        return '3 oz';
      } else {
        return '>3 oz';
      }
    } else {
      return '';
    }
  } else {
    return '';
  }
});

const shippingIndex = ref(0);
const selectedShipping = computed<ShippingCsv>(() => props.shippingExport[shippingIndex.value]);
const formattedShipping = computed(() => {
  const r = selectedShipping.value;
  if (r)
    return [`${r.FirstName} ${r.LastName}`, r.Address1, r.Address2 ? r.Address2 : null, `${r.City}, ${r.State} ${r.PostalCode}`]
      .filter(Boolean)
      .join('\n');
  else return null;
});

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handleKey = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') handleGoLeft();
  if (event.key === 'ArrowRight') handleGoRight();
  if (event.key === 'c') copyButton.value.$el.focus();
};

const handleGoLeft = async () => {
  if (shippingIndex.value - 1 >= 0) {
    shippingIndex.value -= 1;
  }
};

const handleGoRight = async () => {
  if (shippingIndex.value + 1 <= props.shippingExport.length - 1) {
    shippingIndex.value += 1;
  }
};

const copyToClipboard = async () => {
  try {
    if (formattedShipping.value) {
      await navigator.clipboard.writeText(formattedShipping.value);
      toast.add({ severity: 'success', summary: 'Copied', detail: 'Shipping address copied to clipboard.', life: 3000 });
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy shipping address to clipboard.', life: 3000 });
  }
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(() => {
  window.addEventListener('keydown', handleKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey);
});
</script>
