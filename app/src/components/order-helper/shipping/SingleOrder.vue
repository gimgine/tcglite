<template>
  <span class="text-xs italic">
    Press <span class="rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">C</span> to focus the copy button.
  </span>
  <span class="mt-1 text-xs italic"> Use the arrow keys to navigate between shipping labels. </span>
  <span class="mt-1 mb-4 text-xs italic">
    Use <span class="rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">Enter</span> or
    <span class="rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">Space</span> to copy to the clipboard.
  </span>

  <div class="mr-32 text-right text-sm">
    <span
      v-show="postageRequired !== ''"
      v-tooltip.top="`1 oz: <= ${ONE_OUNCE_LIMIT} cards\n2 oz: <= ${TWO_OUNCE_LIMIT} cards\n3 oz: <= ${THREE_OUNCE_LIMIT} cards`"
      class="mr-2 rounded-sm bg-gray-100 px-2 py-0.5 text-xs font-bold"
    >
      {{ postageRequired }}
    </span>
    <span
      :class="`mr-2 rounded-sm px-2 py-0.5 text-xs font-bold ${shippingMethod === 'Tracking' ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600'}`"
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
    <div :class="['mx-28 flex flex-col rounded border border-gray-200 shadow', isBigOrder ? 'animate-flash' : '']">
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
import { OrderService } from '@/service/order-service';
import { type ShippingCsv } from '@/util/csv-parse';
import { Button, useToast } from 'primevue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ shippingExport: ShippingCsv[] }>();
defineEmits<{ back: []; done: [] }>();

// Template Refs ----------------------------------------------------------------------
const copyButton = ref();

// Variables --------------------------------------------------------------------------
const ONE_OUNCE_LIMIT = 10;
const TWO_OUNCE_LIMIT = 20;
const THREE_OUNCE_LIMIT = 35;

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const isBigOrder = computed(() => {
  if (selectedShipping.value) {
    return selectedShipping.value['Item Count'] >= 10;
  } else {
    return false;
  }
});

const shippingMethod = computed(() => {
  if (selectedShipping.value) {
    return selectedShipping.value['Value Of Products'] + selectedShipping.value['Shipping Fee Paid'] >= new OrderService().TRACKING_THRESHOLD
      ? 'Tracking'
      : 'Envelope';
  } else {
    return '';
  }
});

const postageRequired = computed(() => {
  if (selectedShipping.value) {
    const cardCount = selectedShipping.value['Item Count'];
    if (shippingMethod.value === 'Envelope') {
      if (cardCount <= ONE_OUNCE_LIMIT) {
        return '1 oz';
      } else if (cardCount <= TWO_OUNCE_LIMIT) {
        return '2 oz';
      } else if (cardCount <= THREE_OUNCE_LIMIT) {
        return '3 oz';
      } else {
        return 'Too big';
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
let intervalId: NodeJS.Timeout | undefined = undefined;
watch(isBigOrder, (newValue) => {
  if (newValue) {
    if (!intervalId) {
      intervalId = setInterval(() => {
        toast.add({ summary: 'Big Order Alert', detail: 'Additional postage may be required.', severity: 'error', life: 1000 });
      }, 1000);
    }
  } else {
    clearInterval(intervalId);
    intervalId = undefined;
  }
});

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
  if (intervalId) {
    clearInterval(intervalId);
  }
  window.removeEventListener('keydown', handleKey);
});
</script>

<style>
@keyframes flash {
  0%,
  100% {
    background-color: var(--color-red-100);
    color: black;
  }
  50% {
    background-color: white;
    color: black;
  }
}

.animate-flash {
  animation: flash 1.5s infinite;
}
</style>
