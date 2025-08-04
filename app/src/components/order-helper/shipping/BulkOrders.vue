<template>
  <div class="relative my-2 h-full w-full">
    <div class="absolute top-1/2 left-9 flex flex-col items-center">
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
    <div class="mx-28 flex flex-col gap-4 rounded border border-gray-200 p-4 shadow">
      <div>
        <span
          v-show="bulkOrders[shippingIndex]?.type !== 'Tracking'"
          v-tooltip.top="`1 oz: <= ${ONE_OUNCE_LIMIT} cards\n2 oz: <= ${TWO_OUNCE_LIMIT} cards\n3 oz: <= ${THREE_OUNCE_LIMIT} cards`"
          class="mr-2 rounded-sm bg-gray-100 px-2 py-0.5 text-xs font-bold"
        >
          {{ bulkOrders[shippingIndex]?.ounces + ' oz' }}
        </span>
        <span
          :class="`mr-2 rounded-sm px-2 py-0.5 text-xs font-bold ${bulkOrders[shippingIndex]?.type === 'Tracking' ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600'}`"
        >
          {{ bulkOrders[shippingIndex]?.type }}
        </span>
      </div>

      <div class="flex flex-col">
        <div class="border-b border-gray-300 text-sm text-gray-500">
          <span>Orders</span>
          <span class="float-right">{{ `(${bulkOrders[shippingIndex]?.orders.length})` }}</span>
        </div>
        <ul class="h-24 overflow-y-scroll">
          <li v-for="order in bulkOrders[shippingIndex]?.orders" :key="order['Order #']">
            {{ order.FirstName + ' ' + order.LastName }}
          </li>
        </ul>
      </div>

      <div class="flex flex-col">
        <span class="border-b border-gray-300 text-sm text-gray-500">Group Name</span>
        <div class="flex items-center justify-between">
          <span class="font-mono"> {{ groupName }}</span>
          <Button icon="pi pi-copy" variant="text" size="small" severity="info" rounded @click="copyToClipboard" />
        </div>
      </div>
    </div>
    <div class="absolute top-1/2 right-9">
      <Button
        icon="pi pi-arrow-right"
        variant="text"
        rounded
        size="small"
        severity="secondary"
        :disabled="shippingIndex === bulkOrders.length - 1"
        @click="handleGoRight"
        @keyup="handleGoRight"
      />
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <Button severity="secondary" label="Back" icon="pi pi-arrow-left" icon-pos="left" @click="$emit('back')" />
    <Button ref="copyButton" class="w-fit" icon="pi pi-download" label="Contacts CSV" severity="info" @click="handleCsvDownload" />
    <Button class="w-fit" icon="pi pi-check" label="Done" :disabled="shippingIndex !== bulkOrders.length - 1" @click="$emit('done')" />
  </div>
</template>

<script setup lang="ts">
import { OrderService } from '@/service/order-service';
import { type ShippingCsv } from '@/util/csv-parse';
import { Button, useToast } from 'primevue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import Papa from 'papaparse';

// Types ------------------------------------------------------------------------------
interface BulkOrder {
  type: 'Tracking' | 'Envelope';
  ounces: number;
  orders: ShippingCsv[];
}

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ shippingExport: ShippingCsv[] }>();
defineEmits<{ back: []; done: [] }>();

// Template Refs ----------------------------------------------------------------------
const copyButton = ref();

// Variables --------------------------------------------------------------------------
const ONE_OUNCE_LIMIT = 9;
const TWO_OUNCE_LIMIT = 20;
const THREE_OUNCE_LIMIT = 35;

const orderService = new OrderService();

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();
const shippingIndex = ref(0);

const bulkOrders = computed<BulkOrder[]>(() => {
  const result: BulkOrder[] = [];

  const envelopeMap: Record<1 | 2 | 3 | 0, ShippingCsv[]> = {
    1: [],
    2: [],
    3: [],
    0: []
  };

  const trackingList: ShippingCsv[] = [];

  for (const order of props.shippingExport) {
    const total = order['Shipping Fee Paid'] + order['Value Of Products'];
    const count = order['Item Count'];

    if (total >= orderService.TRACKING_THRESHOLD) {
      trackingList.push(order);
    } else {
      if (count <= ONE_OUNCE_LIMIT) {
        envelopeMap[1].push(order);
      } else if (count <= TWO_OUNCE_LIMIT) {
        envelopeMap[2].push(order);
      } else if (count <= THREE_OUNCE_LIMIT) {
        envelopeMap[3].push(order);
      } else {
        envelopeMap[0].push(order);
      }
    }
  }

  if (trackingList.length > 0) {
    result.push({
      type: 'Tracking',
      ounces: 0,
      orders: trackingList
    });
  }

  for (const ounce of [1, 2, 3, 0] as const) {
    if (envelopeMap[ounce].length > 0) {
      result.push({
        type: 'Envelope',
        ounces: ounce,
        orders: envelopeMap[ounce]
      });
    }
  }

  return result;
});

const groupName = computed(
  () =>
    `${new Date().toLocaleDateString().slice(0, -5)} ${new Date().toLocaleTimeString().slice(0, -6)} ${bulkOrders.value[shippingIndex.value]?.type === 'Tracking' ? 'Tracking' : `${bulkOrders.value[shippingIndex.value]?.ounces}oz`}`
);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handleKey = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') handleGoLeft();
  if (event.key === 'ArrowRight') handleGoRight();
};

const handleGoLeft = async () => {
  if (shippingIndex.value - 1 >= 0) {
    shippingIndex.value -= 1;
  }
};

const handleGoRight = async () => {
  if (shippingIndex.value + 1 <= bulkOrders.value.length - 1) {
    shippingIndex.value += 1;
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(groupName.value);
    toast.add({ severity: 'success', summary: 'Copied', detail: 'Group name copied to clipboard.', life: 3000 });
  } catch (err) {
    console.error('Failed to copy:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy group name to clipboard.', life: 3000 });
  }
};

const handleCsvDownload = () => {
  const stampsCsv = bulkOrders.value[shippingIndex.value].orders.map((order) => {
    return {
      Name: `${order.FirstName} ${order.LastName}`,
      Company: order.Address2 ? order.Address1 : null,
      Title: null,
      Department: null,
      Street: order.Address2 ? order.Address2 : order.Address1,
      City: order.City,
      State: order.State,
      Zip: order.PostalCode,
      Country: order.Country === 'US' ? 'United States' : '',
      Email: null,
      Phone: null
    };
  });

  const csv = Papa.unparse(stampsCsv, { quotes: true, header: true });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${groupName.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(() => {
  window.addEventListener('keydown', handleKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey);
});
</script>
