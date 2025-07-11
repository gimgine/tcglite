<template>
  <div class="flex w-full flex-grow flex-col items-center justify-center">
    <div :class="`relative w-full ${currentMode === 'pullSheet' ? 'max-w-3xl' : 'max-w-2xl'}`">
      <div class="absolute -top-10 right-0">
        <Button icon="pi pi-undo" variant="text" rounded size="small" severity="secondary" @click="handleReset" />
      </div>

      <div class="rounded-md bg-white p-8 shadow">
        <span class="text-3xl font-semibold">Order Helper</span>

        <div v-show="currentMode === 'upload'" class="flex h-full flex-col justify-between">
          <div class="my-4 flex flex-col items-start gap-8">
            <div>
              <div class="mb-2">Upload Pull Sheet</div>
              <FileUpload accept=".csv" mode="basic" @select="handlePullSheetUpload" />
            </div>
            <div>
              <div class="mb-2">Upload Shipping Export</div>
              <FileUpload ref="fileUpload" accept=".csv" mode="basic" @select="handleShippingExportUpload" />
            </div>
          </div>
          <div class="flex w-full flex-col items-end">
            <Button
              severity="secondary"
              label="Next"
              icon="pi pi-arrow-right"
              icon-pos="right"
              :disabled="!pullSheet.length || !shippingExport.length"
              @click="
                currentMode = 'pullSheet';
                shippingIndex = 0;
              "
            />
          </div>
        </div>

        <div v-show="currentMode === 'pullSheet'" class="flex flex-col justify-between">
          <span class="my-4 text-xl">Pull Sheet</span>

          <div class="grid max-h-[38rem] grid-cols-12 gap-8 overflow-y-auto">
            <div v-for="setGroup in groupedBySet" :key="setGroup.set" class="col-span-6">
              <div class="mb-2 border-b border-gray-300 text-sm text-gray-600">
                <span>{{ setGroup.set }}</span>
                <span class="float-right">{{ ` (${setGroup.pulls.length})` }}</span>
              </div>
              <ul>
                <li v-for="pull in setGroup.pulls" :key="pull['Product Name']" class="mb-1">
                  <span v-if="pull.Condition.includes('Foil')" class="bg-foil mr-1 rounded-md px-2 text-white drop-shadow">F</span>
                  <b>{{ `${pull.Quantity} ` }}</b>
                  <span class="italic">{{ `${abbrCondition(pull.Condition as Condition)} ` }}</span>
                  <span>{{ `${pull['Product Name']} #${pull.Number}` }}</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="flex w-full flex-col items-end">
            <Button severity="secondary" label="Next" icon="pi pi-arrow-right" icon-pos="right" @click="currentMode = 'shipping'" />
          </div>
        </div>

        <div v-show="currentMode === 'shipping'" class="flex h-full flex-col">
          <span class="mt-4 mb-2 text-xl">Shipping</span>
          <span class="text-xs italic">
            Press <span class="rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">C</span> to focus the copy button.
          </span>
          <span class="mt-1 text-xs italic"> Use the arrow keys to navigate between shipping labels. </span>
          <span class="mt-1 mb-4 text-xs italic">
            Use <span class="rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">Enter</span> or
            <span class="rounded border border-gray-400 bg-gray-200 px-1 py-0.5 font-mono">Space</span> to copy to the clipboard.
          </span>

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
      </div>
    </div>
  </div>

  <Dialog v-model:visible="isUploadModalOpen" header="Upload Shipping Export" modal>
    <span>Would you like to upload the shipping export CSV to the orders table?</span>

    <template #footer>
      <Button label="No" severity="secondary" @click="handleReset" />
      <Button label="Yes" :loading="isYesLoading" @click="handleYes" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { OrderService } from '@/service/order-service';
import { useOrderStore } from '@/store/order-store';
import { parsePullSheetCsv, parseShippingCsv, type PullSheetCsv, type ShippingCsv } from '@/util/csv-parse';
import { Button, Dialog, FileUpload, useToast, type FileUploadSelectEvent } from 'primevue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Types ------------------------------------------------------------------------------
type HelperMode = 'upload' | 'pullSheet' | 'shipping';
type Condition = 'Near Mint' | 'Lightly Played' | 'Moderately Played' | 'Heavily Played';

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const copyButton = ref();

// Variables --------------------------------------------------------------------------
const orderService = new OrderService();

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();
const orderStore = useOrderStore();

const pullSheet = ref<PullSheetCsv[]>([]);
const shippingExport = ref<ShippingCsv[]>([]);

const currentMode = ref<HelperMode>('upload');
const isUploadModalOpen = ref(false);
const isYesLoading = ref(false);

const groupedBySet = computed(() => {
  const groups: Record<string, PullSheetCsv[]> = {};

  for (const record of pullSheet.value) {
    if (!groups[record.Set]) {
      groups[record.Set] = [];
    }
    groups[record.Set].push(record);
  }

  return Object.entries(groups)
    .sort(([setA], [setB]) => setA.localeCompare(setB))
    .map(([set, pulls]) => ({
      set,
      pulls: pulls.slice().sort((a, b) => {
        const aNum = parseInt(a.Number, 10);
        const bNum = parseInt(b.Number, 10);

        if (isNaN(aNum) || isNaN(bNum)) {
          return a.Number.localeCompare(b.Number);
        }

        return aNum - bNum;
      })
    }));
});

const shippingIndex = ref(0);
const selectedShipping = computed<ShippingCsv>(() => shippingExport.value[shippingIndex.value]);
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
  if (currentMode.value !== 'shipping') return;
  if (event.key === 'ArrowLeft') handleGoLeft();
  if (event.key === 'ArrowRight') handleGoRight();
  if (event.key === 'c') copyButton.value.$el.focus();
};

const handlePullSheetUpload = async (event: FileUploadSelectEvent) => {
  const parsedPullSheet = await parsePullSheetCsv(event.files[0]);
  pullSheet.value = parsedPullSheet;
};

const handleShippingExportUpload = async (event: FileUploadSelectEvent) => {
  const parsedShippingExport = await parseShippingCsv(event.files[0]);
  shippingExport.value = parsedShippingExport;
};

const handleReset = () => {
  window.location.reload();
};

const handleYes = async () => {
  isYesLoading.value = true;
  await orderService
    .create({ orders: shippingExport.value })
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
      currentMode.value = 'upload';
    });
};

const handleGoLeft = async () => {
  if (shippingIndex.value - 1 >= 0) {
    shippingIndex.value -= 1;
  }
};

const handleGoRight = async () => {
  if (shippingIndex.value + 1 <= shippingExport.value.length - 1) {
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

const abbrCondition = (condition: Condition) => {
  const abbreviations: Record<Condition, string> = {
    'Near Mint': 'NM',
    'Lightly Played': 'LP',
    'Moderately Played': 'MP',
    'Heavily Played': 'HP'
  };

  for (const key of Object.keys(abbreviations)) {
    if (condition.includes(key)) {
      return abbreviations[key as Condition];
    }
  }
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  window.addEventListener('keydown', handleKey);

  // const response = await fetch('/TCGplayer_PullSheet_20250625_093438.csv');
  // const blob = await response.blob();
  // const file = new File([blob], 'PullSheet.csv', { type: blob.type });
  // pullSheet.value = await parsePullSheetCsv(file);
  // console.log(pullSheet.value);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey);
});
</script>
