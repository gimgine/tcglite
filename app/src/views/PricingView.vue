<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 rounded-md bg-white p-8 shadow lg:col-span-6">
      <span class="w-full text-sm text-gray-600">Pricing Options</span>

      <div class="mt-6 flex justify-between">
        <div class="flex gap-2">
          <FloatLabel variant="on">
            <InputNumber id="floorPrice" v-model="floorPrice" type="number" fluid currency="USD" mode="currency" :step="0.01" />
            <label for="floorPrice">Floor Price</label>
          </FloatLabel>

          <FloatLabel variant="on">
            <InputNumber id="marketPriceMultiplier" v-model="marketPriceMultiplier" type="number" fluid :step="0.1" :min-fraction-digits="1" />
            <label for="marketPriceMultiplier">Multiplier</label>
          </FloatLabel>
          <div class="flex items-center gap-1">
            <Checkbox v-model="selected" input-id="selected" binary />
            <label for="selected" class="ml-1 text-sm text-gray-600">Selected Only</label>
          </div>
        </div>

        <Button label="Apply" icon="pi pi-pencil" :disabled="!pricing.length || !marketPriceMultiplier" @click="updatePricing" />
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
        :rows="50"
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
            <InputText v-model="filterModel.value" type="number" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="Set Name" header="Set Name" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="Product Name" header="Product Name" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="Number" header="Number" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="Rarity" header="Rarity" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="Condition" header="Condition" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="TCG Market Price" header="TCG Market Price" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data['TCG Market Price']) }}
          </template>
        </Column>
        <Column field="TCG Low Price With Shipping" header="TCG Low w/ Shipping" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data['TCG Low Price With Shipping']) }}
          </template>
        </Column>
        <Column field="TCG Low Price" header="TCG Low" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data['TCG Low Price']) }}
          </template>
        </Column>
        <Column field="Total Quantity" header="Total Quantity" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="TCG Marketplace Price" header="Our Price" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
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
import { Button, Checkbox, Column, DataTable, FileUpload, FloatLabel, InputNumber, InputText, type FileUploadSelectEvent } from 'primevue';
import { ref } from 'vue';
const floorPrice = ref(0.2);
const marketPriceMultiplier = ref(1.0);
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

const handlePricingUpload = async (event: FileUploadSelectEvent) => {
  const parsedPricing = await parsePricingCsv(event.files[0]);
  pricing.value = parsedPricing;
};

const updatePricing = () => {
  (selected.value ? selectedRows.value : pricing.value).forEach((product) => {
    if (product['TCG Market Price'] <= floorPrice.value) {
      product['TCG Marketplace Price'] = floorPrice.value;
    } else {
      product['TCG Marketplace Price'] = +(product['TCG Market Price'] * marketPriceMultiplier.value).toFixed(2);
    }
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
</script>
