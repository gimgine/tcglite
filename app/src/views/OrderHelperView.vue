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
              @click="currentMode = 'pullSheet'"
            />
          </div>
        </div>

        <div v-show="currentMode === 'pullSheet'" class="flex flex-col justify-between">
          <span class="my-4 text-xl">Pull Sheet</span>

          <div class="grid max-h-[38rem] grid-cols-12 gap-8 overflow-y-auto">
            <div v-for="setGroup in groupedBySet" :key="setGroup.set" class="col-span-6">
              <span class="text-sm text-gray-600">{{ setGroup.set }}</span>
              <ul>
                <li v-for="pull in setGroup.pulls" :key="pull.productName" class="mb-1">
                  <span v-if="pull.condition.includes('Foil')" class="bg-foil mr-1 rounded-md px-2 text-white drop-shadow">F</span>
                  <b>{{ `${pull.quantity} ` }}</b>
                  <span class="italic">{{ `${abbrCondition(pull.condition as Condition)} ` }}</span>
                  <span>{{ `${pull.productName} #${pull.number}` }}</span>
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
            <Button class="w-fit" icon="pi pi-check" label="Done" :disabled="shippingIndex !== shippingExport.length - 1" @click="handleReset" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderCsvRecord, PullSheetCsvRecord } from '@/types';
import { Button, FileUpload, useToast, type FileUploadSelectEvent } from 'primevue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Types ------------------------------------------------------------------------------
type HelperMode = 'upload' | 'pullSheet' | 'shipping';
type Condition = 'Near Mint' | 'Lightly Played' | 'Moderately Played' | 'Heavily Played';

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const copyButton = ref();

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const pullSheet = ref<PullSheetCsvRecord[]>([]);
const shippingExport = ref<OrderCsvRecord[]>([]);

const currentMode = ref<HelperMode>('upload');

const groupedBySet = computed(() => {
  const groups: Record<string, PullSheetCsvRecord[]> = {};

  for (const record of pullSheet.value) {
    if (!groups[record.set]) {
      groups[record.set] = [];
    }
    groups[record.set].push(record);
  }

  return Object.entries(groups).map(([set, pulls]) => ({ set, pulls }));
});

const shippingIndex = ref(0);
const selectedShipping = computed<OrderCsvRecord>(() => shippingExport.value[shippingIndex.value]);
const formattedShipping = computed(() => {
  const r = selectedShipping.value;
  if (r)
    return [`${r.firstName} ${r.lastName}`, r.address, r.addressTwo ? r.addressTwo : null, `${r.city}, ${r.state} ${r.postalCode}`]
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
  const parsedPullSheet = await parsePullSheet(event.files[0]);
  pullSheet.value = parsedPullSheet;
};

const handleShippingExportUpload = async (event: FileUploadSelectEvent) => {
  const parsedShippingExport = await parseShippingExport(event.files[0]);
  shippingExport.value = parsedShippingExport;
};

const handleReset = () => {
  window.location.reload();
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
      toast.add({ severity: 'success', summary: 'Copied', detail: 'Shipping address copied to clipboard.' });
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy shipping address to clipboard.' });
  }
};

const parsePullSheet = async (file: Blob): Promise<PullSheetCsvRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Helper to parse CSV line respecting quotes
    const parseCSVLine = (line: string): string[] => {
      const regex = /"([^"]*)"|([^,]+)/g;
      const result: string[] = [];
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match[1] !== undefined) {
          result.push(match[1]);
        } else {
          result.push(match[2]);
        }
      }

      return result;
    };

    reader.onload = () => {
      const result = reader.result as string;
      const lines = result.trim().split(/\r?\n/);
      const newPulls: PullSheetCsvRecord[] = [];

      // Parse header
      const header = parseCSVLine(lines[0]);
      const expectedHeader = [
        'Product Line',
        'Product Name',
        'Condition',
        'Number',
        'Set',
        'Rarity',
        'Quantity',
        'Main Photo URL',
        'Set Release Date',
        'SkuId',
        'Order Quantity'
      ];

      if (header.join(',') !== expectedHeader.join(',')) {
        console.warn('Pull sheet not of correct type.');
        return resolve([]);
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const splitLine = parseCSVLine(line);
        if (splitLine[0] === 'Orders Contained in Pull Sheet:') continue;
        if (splitLine.length < 11) continue;

        const newPull: PullSheetCsvRecord = {
          productLine: splitLine[0],
          productName: splitLine[1],
          condition: splitLine[2],
          number: Number(splitLine[3]),
          set: splitLine[4],
          rarity: splitLine[5],
          quantity: Number(splitLine[6]),
          mainPhotoUrl: splitLine[7],
          setReleaseDate: splitLine[8]
        };

        newPulls.push(newPull);
      }

      resolve(newPulls);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

const parseShippingExport = async (file: Blob): Promise<OrderCsvRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const lines = result.split(/\r?\n/);

      if (
        lines[0] !==
        'Order #,FirstName,LastName,Address1,Address2,City,State,PostalCode,Country,Order Date,Product Weight,Shipping Method,Item Count,Value Of Products,Shipping Fee Paid,Tracking #,Carrier'
      ) {
        console.warn('File not of correct type.');
        return;
      }

      const newOrders = [];

      for (const line of lines) {
        if (line.split(',')[0] === 'Order #') continue;

        const splitLine = line.split(',').map((v) => v.replace(/^"|"$/g, ''));
        if (splitLine.length < 17) continue;

        const [year, month, day] = splitLine[9].split('-');
        const newOrder: OrderCsvRecord = {
          orderNumber: splitLine[0],
          firstName: splitLine[1],
          lastName: splitLine[2],
          address: splitLine[3],
          addressTwo: splitLine[4],
          city: splitLine[5],
          state: splitLine[6],
          postalCode: splitLine[7],
          country: splitLine[8],
          orderDate: new Date(Date.UTC(+year, +month - 1, +day, 12, 0, 0)),
          productWeight: +splitLine[10],
          shippingMethod: splitLine[11],
          itemCount: +splitLine[12],
          productValue: +splitLine[13],
          shippingFee: +splitLine[14],
          trackingNumber: splitLine[15],
          carrier: splitLine[16]
        };

        newOrders.push(newOrder);
      }

      resolve(newOrders);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
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

  // pullSheet.value = await parsePullSheet(await (await fetch('/public/TCGplayer_PullSheet_20250625_093438.csv')).blob());
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey);
});
</script>
