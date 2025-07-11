<template>
  <div class="flex h-full flex-col justify-between">
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
        @click="$emit('next')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { parsePullSheetCsv, parseShippingCsv, type PullSheetCsv, type ShippingCsv } from '@/util/csv-parse';
import { type FileUploadSelectEvent, FileUpload, Button } from 'primevue';
import { ref } from 'vue';

const pullSheet = ref<PullSheetCsv[]>([]);
const shippingExport = ref<ShippingCsv[]>([]);

const emit = defineEmits<{
  next: [];
  pullSheetUpload: [pullSheet: PullSheetCsv[]];
  shippingExportUpload: [shippingExport: ShippingCsv[]];
}>();

const handlePullSheetUpload = async (event: FileUploadSelectEvent) => {
  const parsedPullSheet = await parsePullSheetCsv(event.files[0]);
  pullSheet.value = parsedPullSheet;
  emit('pullSheetUpload', pullSheet.value);
};

const handleShippingExportUpload = async (event: FileUploadSelectEvent) => {
  const parsedShippingExport = await parseShippingCsv(event.files[0]);
  shippingExport.value = parsedShippingExport;
  emit('shippingExportUpload', shippingExport.value);
};
</script>
