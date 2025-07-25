<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 rounded-md bg-white p-6 shadow">
      <span class="text-sm text-gray-600">Pricing Options</span>
      <Button
        v-tooltip.top="'ManaBox Converter'"
        icon="pi pi-wrench"
        class="float-right"
        size="small"
        severity="secondary"
        @click="navigateManaBoxConverter"
      />
      <Message size="small" severity="secondary" class="my-1 w-fit">
        Use <code>l</code> for the low price and <code>m</code> for the market price in the formula.
      </Message>
      <div class="mt-3 flex items-end justify-between">
        <div class="flex gap-2">
          <FloatLabel variant="on">
            <InputNumber id="floorPrice" v-model="floorPrice" type="number" fluid currency="USD" mode="currency" :step="0.01" />
            <label for="floorPrice">Floor Price</label>
          </FloatLabel>
          <div class="flex flex-col">
            <FloatLabel variant="on">
              <label for="formula">Formula</label>
              <InputText id="formula" v-model="formula" />
            </FloatLabel>
          </div>
          <div class="flex items-center gap-1">
            <Checkbox v-model="minLow" input-id="minLow" binary />
            <label for="minLow" class="ml-1 text-sm text-gray-600">Minimum Low</label>
          </div>
          <div class="flex items-center gap-1">
            <Checkbox v-model="selected" input-id="selected" binary />
            <label for="selected" class="ml-1 text-sm text-gray-600">Selected Only</label>
          </div>
        </div>

        <Button label="Apply" icon="pi pi-pencil" :disabled="!pricing.length || !formula" @click="updatePricing" />
      </div>
    </div>
    <div class="col-span-12 rounded-md bg-white p-8 shadow">
      <div class="mb-2 flex items-center gap-2">
        <span class="mr-auto text-lg font-semibold">Pricing Table</span>
        <FileUpload mode="basic" choose-label="Pricing CSV" choose-icon="pi pi-dollar" accept=".csv" auto @select="handlePricingUpload" />
        <Button label="Export" icon="pi pi-file-export" @click="exportPricing" />
      </div>
      <ag-grid-vue ref="grid" class="h-[calc(100vh-28rem)]" :grid-options :column-defs :row-data="pricing" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { parsePricingCsv, type PricingCsv } from '@/util/csv-parse';
import { formatCurrency } from '@/util/functions';
import type { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import Papa from 'papaparse';
import { Button, Checkbox, FileUpload, FloatLabel, InputNumber, InputText, Message, useToast, type FileUploadSelectEvent } from 'primevue';
import { nextTick, ref } from 'vue';

// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const grid = ref();

// Variables --------------------------------------------------------------------------
const gridOptions: GridOptions<PricingCsv> = {
  defaultColDef: { filter: true },
  pagination: true,
  paginationPageSize: 20,
  rowSelection: { mode: 'multiRow', selectAll: 'filtered' },
  suppressCellFocus: true,
  onModelUpdated: (e) => {
    e.api.autoSizeAllColumns();
    nextTick(() => {
      if (e.api.getAllDisplayedColumnGroups()!.reduce((acc, c) => acc + c.getActualWidth(), 0) < grid.value?.$el.clientWidth) {
        e.api.sizeColumnsToFit();
      }
    });
  },
  onSelectionChanged: (e) => {
    selectedRows.value = e.api.getSelectedRows();
  }
};
const columnDefs: ColDef<PricingCsv>[] = [
  { field: 'TCGplayer Id', headerName: 'ID', hide: true },
  { field: 'Set Name', headerName: 'Set' },
  { field: 'Product Name', headerName: 'Name' },
  { field: 'Number' },
  { field: 'Rarity', hide: true },
  { field: 'Condition' },
  {
    field: 'TCG Market Price',
    headerName: 'Market Price',
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Market Price']) ?? ''
  },
  {
    field: 'TCG Direct Low',
    headerName: 'Direct Low',
    hide: true,
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Direct Low']) ?? ''
  },
  {
    field: 'TCG Low Price With Shipping',
    headerName: 'Low Shipping',
    hide: true,
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Low Price With Shipping']) ?? ''
  },
  { field: 'TCG Low Price', headerName: 'Low', valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Low Price']) ?? '' },
  {
    field: 'TCG Marketplace Price',
    headerName: 'Our Price',
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Marketplace Price']) ?? '',
    editable: true,
    singleClickEdit: true
  },
  { field: 'Total Quantity', headerName: 'Quantity' }
];

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const formula = ref('');
const floorPrice = ref(0.2);
const minLow = ref(false);
const selected = ref(false);

const pricing = ref<PricingCsv[]>([]);

const selectedRows = ref<PricingCsv[]>([]);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handlePricingUpload = async (event: FileUploadSelectEvent) => {
  const parsedPricing = await parsePricingCsv(event.files[0]);
  pricing.value = parsedPricing;
};

const updatePricing = () => {
  if (!/^[0-9lm+\-*/().]+$/.test(formula.value))
    return toast.add({
      severity: 'error',
      summary: 'Invalid Formula',
      detail: 'The formula only allows numbers, l, m, and basic math symbols.',
      life: 3000
    });
  try {
    eval(formula.value.replace('l', '1').replace('m', '1'));
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error Evaluating Formula',
      detail: e,
      life: 3000
    });
    return;
  }
  const rows = selected.value ? selectedRows.value : pricing.value;
  const errorRows: PricingCsv[] = [];
  rows.forEach((product) => {
    try {
      const value = eval(formula.value.replace('l', `${product['TCG Low Price']}`).replace('m', `${product['TCG Market Price']}`));
      product['TCG Marketplace Price'] = +Math.max(floorPrice.value, minLow.value ? Math.max(product['TCG Low Price'], value) : value).toFixed(2);
    } catch {
      errorRows.push(product);
    }
  });
  if (rows.length - errorRows.length > 0)
    toast.add({
      severity: 'success',
      summary: 'Updated Prices',
      detail: `Successfully updated the prices for ${rows.length - errorRows.length} records.`,
      life: 3000
    });
  if (errorRows.length > 0)
    toast.add({
      severity: 'error',
      summary: 'Error Updating Prices',
      detail: `There was an error updating the price for the records with the following IDs: \n ${errorRows.map((r) => r['TCGplayer Id'])}`
    });
};

const exportPricing = () => {
  pricing.value.forEach((p) => (p['Add to Quantity'] = 0));

  const sanitized = pricing.value.map((row) => {
    const sanitizedRow: Record<string, string | number> = {};

    for (const key in row) {
      const value = (row as Record<string, string | number>)[key];
      sanitizedRow[key] = value === null ? '' : value;
    }

    return sanitizedRow;
  });

  const csv = Papa.unparse(sanitized, { quotes: true });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'updated_pricing.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const navigateManaBoxConverter = () => {
  window.open('https://mtg.yourfriendshouse.co/', '_blank');
};

// Lifecycle Hooks --------------------------------------------------------------------
</script>
