<template>
  <Dialog v-model:visible="shippingDialogVisible" modal>
    <DataTable :value="orders">
      <template #header>
        <span>Confirm Shipping Method</span>
      </template>
      <Column header="Name">
        <template #body="slotProps">
          {{ `${slotProps.data.firstName} ${slotProps.data.lastName}` }}
        </template>
      </Column>
      <Column field="orderDate" header="Order Date">
        <template #body="slotProps">
          {{ slotProps.data.orderDate.toLocaleDateString() }}
        </template>
      </Column>
      <Column header="Total Price">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.productValue + slotProps.data.shippingFee) }}
        </template>
      </Column>
      <Column header="Shipping">
        <template #body="slotProps">
          <Select v-model="slotProps.data.shippingCost" :options="shippingMethods" option-label="name" option-value="cost">
            <template #value="selectSlotProps">
              <span
                :class="`rounded-sm px-2 py-0.5 text-xs font-bold ${selectSlotProps.value === TRACKING.cost ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600'}`"
              >
                {{ getShippingMethod(selectSlotProps.value)?.name }}
              </span>
            </template>
            <template #option="selectSlotProps">
              <span
                :class="`rounded-sm px-2 py-0.5 text-xs font-bold ${selectSlotProps.option.cost === TRACKING.cost ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600'}`"
              >
                {{ selectSlotProps.option.name }}
              </span>
            </template>
          </Select>
        </template>
      </Column>
    </DataTable>
    <template #footer>
      <Button label="Submit" :loading="isSubmitLoading" @click="$emit('submit')" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Button, Column, DataTable, Select, Dialog } from 'primevue';
import type { ShippingCsvRecord } from '@/types';
import { formatCurrency } from '@/util/functions';
import { ref } from 'vue';

defineProps<{ orders: ShippingCsvRecord[] }>();

defineEmits<{ submit: [] }>();

const ENVELOPE = { cost: 1, name: 'Envelope' };
const TRACKING = { cost: 5, name: 'Tracking' };
const shippingMethods = ref<{ cost: number; name: string }[]>([ENVELOPE, TRACKING]);

const shippingDialogVisible = ref(false);
const isSubmitLoading = ref(false);

const open = () => {
  shippingDialogVisible.value = true;
};

const close = () => {
  shippingDialogVisible.value = false;
};

const toggleSubmitLoading = () => {
  isSubmitLoading.value = !isSubmitLoading.value;
};

defineExpose({ open, close, toggleSubmitLoading });

const getShippingMethod = (shippingCost: number) => {
  return shippingMethods.value.find((sm) => sm.cost === shippingCost);
};
</script>
