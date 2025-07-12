<template>
  <div class="flex h-full flex-col">
    <div class="mt-4 mb-2 flex justify-between">
      <span class="text-xl">Shipping</span>
    </div>
    <span class="text-xs italic">
      Press <span class="rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">C</span> to focus the copy button.
    </span>
    <span class="mt-1 text-xs italic"> Use the arrow keys to navigate between shipping labels. </span>
    <span class="mt-1 mb-4 text-xs italic">
      Use <span class="rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">Enter</span> or
      <span class="rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">Space</span> to copy to the clipboard.
    </span>

    <div class="mr-32 text-right text-sm">{{ `${shippingIndex + 1} of ${shippingExport.length}` }}</div>

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
      <div class="mx-28 flex flex-col rounded border border-gray-200 shadow">
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
      <Button class="invisible w-fit" icon="pi pi-copy" label="Done" />
      <Button ref="copyButton" class="w-fit" icon="pi pi-copy" label="Copy" severity="info" @click="copyToClipboard" />
      <Button
        class="w-fit"
        icon="pi pi-check"
        label="Done"
        :disabled="shippingIndex !== shippingExport.length - 1"
        @click="isUploadModalOpen = true"
      />
    </div>
  </div>

  <Dialog v-model:visible="isUploadModalOpen" header="Upload Shipping Export" modal>
    <span>Would you like to upload the shipping export CSV to the orders table?</span>

    <template #footer>
      <Button label="No" severity="secondary" @click="$router.push({ name: 'upload' })" />
      <Button label="Yes" :loading="isYesLoading" @click="handleYes" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import router from '@/router';
import { OrderService } from '@/service/order-service';
import { useOrderStore } from '@/store/order-store';
import { type ShippingCsv } from '@/util/csv-parse';
import { Button, useToast, Dialog } from 'primevue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{ shippingExport: ShippingCsv[] }>();

const copyButton = ref();

const toast = useToast();
const orderStore = useOrderStore();

const orderService = new OrderService();

const isUploadModalOpen = ref(false);
const isYesLoading = ref(false);
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
    })
    .finally(() => {
      isYesLoading.value = false;
      isUploadModalOpen.value = false;
      router.push({ name: 'upload' });
    });
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

onMounted(() => {
  window.addEventListener('keydown', handleKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey);
});
</script>
