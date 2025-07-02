<template>
  <div class="flex w-full flex-grow flex-col items-center justify-center">
    <div class="w-full max-w-2xl rounded-md bg-white p-8 shadow">
      <span class="text-3xl font-semibold">Pricing</span>
      <div class="my-4 flex flex-col items-start gap-8">
        <div>
          <div class="mb-2">Upload MyPricing CSV</div>
          <FileUpload accept=".csv" mode="basic" @select="handlePricingUpload" />
        </div>
        <Button label="Update Pricing" @click="updatePricing" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parsePricingCsv, type PricingCsv } from '@/util/csv-parse';
import Papa from 'papaparse';
import { FileUpload, type FileUploadSelectEvent, Button } from 'primevue';
import { ref } from 'vue';

const FLOOR_PRICE = 0.2;

const pricing = ref<PricingCsv[]>([]);

const handlePricingUpload = async (event: FileUploadSelectEvent) => {
  const parsedPricing = await parsePricingCsv(event.files[0]);
  pricing.value = parsedPricing;
};

const updatePricing = () => {
  pricing.value.forEach((product) => {
    if (product['TCG Marketplace Price'] !== product['TCG Market Price']) {
      product['TCG Marketplace Price'] = product['TCG Market Price'] < FLOOR_PRICE ? FLOOR_PRICE : product['TCG Market Price'];
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
