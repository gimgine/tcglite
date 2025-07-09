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
      <DataTable
        v-model:filters="filters"
        v-model:selection="selectedRows"
        :value="pricing"
        removable-sort
        filter-display="row"
        striped-rows
        paginator
        :rows="10"
        :rows-per-page-options="[10, 25, 50, 100, 500]"
        edit-mode="cell"
        @cell-edit-complete="(e) => (e.data[e.field] = e.newValue ? e.newValue : e.data[e.field])"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <span class="mr-auto text-lg">Pricing Table</span>
            <FileUpload mode="basic" choose-label="Pricing CSV" choose-icon="pi pi-dollar" accept=".csv" auto @select="handlePricingUpload" />
            <Button label="Export" icon="pi pi-file-export" @click="exportPricing" />
          </div>
        </template>
        <Column selection-mode="multiple" header-style="width: 3rem"></Column>
        <Column field="TCGplayer Id" header="TCGPlayer ID" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="number" size="small" fluid @input="filterCallback" />
          </template>
        </Column>
        <Column field="Set Name" header="Set Name" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
        </Column>
        <Column field="Product Name" header="Product Name" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
        </Column>
        <Column field="Number" header="Number" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
        </Column>
        <Column field="Rarity" header="Rarity" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
        </Column>
        <Column field="Condition" header="Condition" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
        </Column>
        <Column field="TCG Market Price" header="TCG Market Price" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data['TCG Market Price']) }}
          </template>
        </Column>
        <Column field="TCG Low Price With Shipping" header="TCG Low w/ Shipping" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data['TCG Low Price With Shipping']) }}
          </template>
        </Column>
        <Column field="TCG Low Price" header="TCG Low" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data['TCG Low Price']) }}
          </template>
        </Column>
        <Column field="Total Quantity" header="Total Quantity" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
        </Column>
        <Column field="TCG Marketplace Price" header="Our Price" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" fluid @input="filterCallback" />
          </template>
          <template #editor="{ data, field }">
            <InputNumber v-model="data[field]" size="small" autofocus fluid mode="currency" currency="USD" :step="0.01" />
          </template>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data['TCG Marketplace Price']) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parsePricingCsv, type PricingCsv } from '@/util/csv-parse';
import { formatCurrency } from '@/util/functions';
import { FilterMatchMode } from '@primevue/core/api';
import Papa from 'papaparse';
import {
  Button,
  Checkbox,
  Column,
  DataTable,
  FileUpload,
  FloatLabel,
  InputNumber,
  InputText,
  Message,
  useToast,
  type FileUploadSelectEvent
} from 'primevue';
import { ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const formula = ref('');
const floorPrice = ref(0.2);
const minLow = ref(false);
const selected = ref(false);

const filters = ref({
  'TCGplayer Id': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'Set Name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'Product Name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  Number: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Rarity: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Condition: { value: null, matchMode: FilterMatchMode.CONTAINS },
  'TCG Market Price': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'TCG Low Price With Shipping': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'TCG Low Price': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'Total Quantity': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'TCG Marketplace Price': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

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
