<template>
  <div class="flex h-full flex-col">
    <div class="mt-4 mb-2 flex justify-between">
      <span class="text-xl">Shipping</span>
      <SelectButton v-model="shippingToolOption" :options="shippingToolOptions" :allow-empty="false" size="small" />
    </div>
    <component
      :is="shippingToolOption === 'Single' ? SingleOrder : BulkOrders"
      :shipping-export
      @done="isUploadModalOpen = true"
      @back="$emit('back')"
    />
  </div>

  <Dialog v-model:visible="isUploadModalOpen" header="Upload Exports" modal>
    <span>Would you like to upload the shipping export CSV and the pull sheet CSV to the server?</span>

    <template #footer>
      <Button label="No" severity="secondary" @click="$router.push({ name: 'upload' })" />
      <Button label="Yes" :loading="isYesLoading" @click="handleYes" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import router from '@/router';
import { OrderItemService } from '@/service/order-item-service';
import { OrderService } from '@/service/order-service';
import { useOrderStore } from '@/store/order-store';
import { type PullSheetCsv, type ShippingCsv } from '@/util/csv-parse';
import { Button, Dialog, SelectButton, useToast } from 'primevue';
import { onMounted, ref, watch } from 'vue';
import BulkOrders from './BulkOrders.vue';
import SingleOrder from './SingleOrder.vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ shippingExport: ShippingCsv[]; pullSheet: PullSheetCsv[] }>();
defineEmits<{ back: [] }>();

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();
const orderStore = useOrderStore();

const orderService = new OrderService();
const cardService = new OrderItemService();

const isUploadModalOpen = ref(false);
const isYesLoading = ref(false);

const shippingToolOption = ref('Bulk');
const shippingToolOptions = ref(['Bulk', 'Single']);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------
watch(shippingToolOption, (newValue) => {
  localStorage.setItem('shippingToolOption', newValue);
});

// Methods ----------------------------------------------------------------------------
const handleYes = async () => {
  isYesLoading.value = true;
  await orderService
    .create({ orders: props.shippingExport })
    .then(() => {
      // TODO check batch response and see if we can return the amount of records added
      orderStore.refresh();
      toast.add({
        severity: 'success',
        summary: 'Orders Added',
        detail: `New orders were added.`,
        life: 3000
      });
    })
    .catch((error: Error) => {
      toast.add({
        severity: 'error',
        summary: 'No Orders Found',
        detail: error.message,
        life: 3000
      });
    });

  await cardService
    .create({ cards: props.pullSheet })
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Cards Added',
        detail: `New cards were added.`,
        life: 3000
      });
    })
    .catch((error: Error) => {
      toast.add({
        severity: 'error',
        summary: 'No Cards Found',
        detail: error.message,
        life: 3000
      });
    })
    .finally(() => {
      isYesLoading.value = false;
      isUploadModalOpen.value = false;
      router.push({ name: 'upload' });
    });
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(() => {
  const cachedShippingToolOption = localStorage.getItem('shippingToolOption');
  if (cachedShippingToolOption) shippingToolOption.value = cachedShippingToolOption;
});
</script>
