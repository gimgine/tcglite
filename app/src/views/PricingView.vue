<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 flex flex-wrap gap-4 rounded-md bg-white p-8 shadow md:col-span-4">
      <div class="w-full text-sm text-gray-600">Market Price</div>
      <FloatLabel variant="on">
        <InputNumber id="floorPrice" v-model="floorPrice" size="small" type="number" />
        <label for="floorPrice">Floor Price</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputNumber id="marketPriceMultiplier" v-model="marketPriceMultiplier" size="small" type="number" />
        <label for="marketPriceMultiplier">Multiplier</label>
      </FloatLabel>
      <div class="flex items-center gap-2">
        <Checkbox v-model="selected" input-id="selected" size="small" binary />
        <label for="selected" class="text-sm text-gray-600">Selected</label>
      </div>
      <Button class="ml-auto" label="Update" :disabled="!pricing.length || !marketPriceMultiplier" @click="updateMarketPrice" />
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
            <Button label="Export" icon="pi pi-export" />
          </div>
        </template>
        <template #empty> Upload the pricing CSV </template>
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
        </Column>
        <Column field="TCG Direct Low" header="TCG Direct Low" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="TCG Low Price With Shipping" header="TCG Low Price Shipping" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="TCG Low Price" header="TCG Low Price" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="Total Quantity" header="Total Quantity" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
        </Column>
        <Column field="TCG Marketplace Price" header="TCG Marketplace Price" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" size="small" @input="filterCallback" />
          </template>
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" type="number" size="small" autofocus fluid />
          </template>
        </Column>
      </DataTable>
    </div>
    <!-- <div>
    <span class="text-3xl font-semibold">Pricing</span>
    <div class="my-4 flex flex-col items-center gap-8">
      <div>
        <FileUpload accept=".csv" mode="basic" @select="handlePricingUpload" />
      </div>
      <FloatLabel variant="on">
        <InputNumber id="floorPrice" v-model="floorPrice" />
        <label for="floorPrice">Floor Price</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputNumber id="marketPriceMultiplier" v-model="marketPriceMultiplier" />
        <label for="marketPriceMultiplier">Market Price Multiplier</label>
      </FloatLabel>
      <Button class="ml-auto" label="Update Pricing" :disabled="!pricing.length || !floorPrice || !marketPriceMultiplier" @click="updatePricing" />
    </div>
  </div> -->
  </div>
</template>

<script setup lang="ts">
import { parsePricingCsv, type PricingCsv } from '@/util/csv-parse';
import Papa from 'papaparse';
import { FileUpload, type FileUploadSelectEvent, DataTable, Column, InputText, FloatLabel, InputNumber, Button, Checkbox } from 'primevue';
import { ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

const floorPrice = ref(0.2);
const marketPriceMultiplier = ref(1);
const selected = ref(false);

const filters = ref({
  'TCGplayer Id': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'Set Name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'Product Name': { value: null, matchMode: FilterMatchMode.CONTAINS },
  Number: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Rarity: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Condition: { value: null, matchMode: FilterMatchMode.CONTAINS },
  'TCG Market Price': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'TCG Direct Low': { value: null, matchMode: FilterMatchMode.CONTAINS },
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

const updateMarketPrice = () => {
  pricing.value.forEach((product) => {
    if (product['TCG Marketplace Price'] !== product['TCG Market Price']) {
      if (product['TCG Market Price'] <= floorPrice.value) {
        product['TCG Marketplace Price'] = floorPrice.value;
      } else {
        product['TCG Marketplace Price'] = product['TCG Market Price'] * marketPriceMultiplier.value;
      }
    }
  });
};

const updatePricing = () => {
  pricing.value.forEach((product) => {
    if (product['TCG Marketplace Price'] !== product['TCG Market Price']) {
      if (floorPrice.value && product['TCG Market Price'] <= floorPrice.value) {
        product['TCG Marketplace Price'] = floorPrice.value;
      } else {
        product['TCG Marketplace Price'] = product['TCG Market Price'] * marketPriceMultiplier.value;
      }
    }
  });

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
