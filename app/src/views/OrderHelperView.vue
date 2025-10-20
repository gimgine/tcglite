<template>
  <div class="flex w-full flex-grow flex-col items-center justify-center">
    <div :class="`relative w-full ${$router.currentRoute.value.name === 'pullSheet' ? 'max-w-4xl' : 'max-w-2xl'}`">
      <div class="absolute -top-10 right-0">
        <Button icon="pi pi-undo" variant="text" rounded size="small" severity="secondary" @click="handleReset" />
      </div>

      <div class="dark:border-surface-700 dark:bg-surface-900 rounded-md border border-gray-200 bg-white p-8 shadow">
        <div class="flex items-center justify-between">
          <span class="text-2xl font-semibold">Order Helper</span>

          <Button label="Manage Orders" icon="pi pi-receipt" outlined :disabled="!shippingExport.length" @click="togglePopover" />
          <Popover ref="manageOrders">
            <div v-if="shippingExport.length" class="flex max-h-96 w-64 flex-col p-1">
              <div class="dark:border-surface-700 text-muted-color border-b border-gray-300 text-sm">
                <span>Orders</span>
                <span class="float-right">{{ `(${shippingExport.length})` }}</span>
              </div>
              <ul class="overflow-y-auto">
                <li
                  v-for="order in shippingExport.sort((a, b) => b['Item Count'] - a['Item Count'])"
                  :key="order['Order #']"
                  class="flex items-center justify-between py-2"
                >
                  <div class="flex items-center gap-2">
                    <span>{{ `${order.FirstName} ${order.LastName}` }}</span>
                    <span class="text-muted-color text-sm italic">{{ `(${order['Item Count']})` }}</span>
                  </div>

                  <Button
                    v-tooltip="'Remove'"
                    text
                    icon="pi pi-times"
                    size="small"
                    rounded
                    severity="danger"
                    @click="removeOrder(order['Order #'])"
                  />
                </li>
              </ul>
            </div>
            <div v-else class="flex items-center">
              <Button
                icon="pi pi-undo"
                label="Reset"
                variant="text"
                severity="secondary"
                @click="
                  () => {
                    manageOrdersPopover?.hide();
                    handleReset();
                  }
                "
              />
            </div>
          </Popover>
        </div>

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
import { Button, Popover } from 'primevue';
import { onMounted, ref, useTemplateRef } from 'vue';

// Types ------------------------------------------------------------------------------
interface OrderQuantity {
  id: string;
  quantity: number;
}

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const manageOrdersPopover = useTemplateRef('manageOrders');

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

const togglePopover = (event: Event) => {
  manageOrdersPopover.value?.show(event);
};

const parseOrderQuantity = (orderQuantity: string): OrderQuantity[] => {
  return orderQuantity
    .split('|')
    .map((s) => s.trim().split(':'))
    .map(([id, quantity]) => ({ id, quantity: Number(quantity) }));
};

const unparseOrderQuantity = (orderQuantity: OrderQuantity[]): string => {
  return orderQuantity.map(({ id, quantity }) => `${id}:${quantity}`).join(' | ');
};

const removeOrder = (orderNumber: string) => {
  if (shippingExport.value.length) {
    shippingExport.value = shippingExport.value.filter((row) => (row['Order #'] ?? '').trim() !== orderNumber);
  }

  pullSheet.value.forEach((pull) => {
    const orderQuantity = parseOrderQuantity(pull['Order Quantity']);
    let quantityRemoved = 0;
    const updatedOrderQuantity = orderQuantity.filter(({ id, quantity }) => {
      if (id !== orderNumber) {
        return true;
      } else {
        quantityRemoved += quantity;
        return false;
      }
    });
    pull.Quantity -= quantityRemoved;
    pull['Order Quantity'] = unparseOrderQuantity(updatedOrderQuantity);
  });

  pullSheet.value = pullSheet.value.filter((pull) => pull.Quantity > 0);
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
