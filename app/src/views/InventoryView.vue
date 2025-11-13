<template>
  <div class="grid h-screen grid-cols-12 gap-4">
    <!-- left col -->
    <div class="dark:border-surface-700 dark:bg-surface-900 col-span-2 rounded-md border border-gray-200 bg-white p-6 shadow">
      <div class="flex h-full flex-col justify-between gap-4">
        <div class="flex h-full flex-col gap-4">
          <span class="text-2xl font-semibold">Inventory</span>
          <Button
            icon="pi pi-search"
            :label="collectionId ? 'Scan Collection' : 'Scan All'"
            @click="collectionId ? handleScan(collectionId) : handleScan()"
          />
          <Button v-show="collectionId" icon="pi pi-refresh" label="Unit COGS" @click="handleUpdateUnitCogs(collectionId!)" />
          <Button class="mt-auto" icon="pi pi-refresh" severity="danger" label="Reset Allocations" text @click="handleResetAllocations" />
        </div>
      </div>
    </div>

    <!-- main content-->
    <div class="dark:bg-surface-900 dark:border-surface-700 col-span-10 h-full rounded-md border border-gray-200 bg-white p-6 shadow">
      <!-- collections list -->
      <div v-show="showCollectionSelection">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="text-xl font-semibold">Collections</div>
            <Button icon="pi pi-plus" text rounded @click="handleAddCollection" />
          </div>
          <InputText placeholder="Search collections" />
        </div>

        <div class="flex flex-col gap-2">
          <div
            v-for="collection in collections"
            :key="collection.id"
            class="dark:border-surface-700 group flex cursor-pointer items-center justify-between rounded-md border border-gray-200 p-6"
            @click="handleCollectionSelect(collection.id)"
          >
            <div class="flex items-center gap-4 transition-opacity group-hover:opacity-50">
              <div class="flex flex-col items-center">
                <Knob
                  :model-value="Math.round(((collection.totalQtySold as number) / (collection.totalQtyAcquired as number)) * 100)"
                  :size="75"
                  value-template="{value}%"
                  readonly
                />
                <span class="text-muted-color text-xs">{{ `${collection.totalQtySold as number} / ${collection.totalQtyAcquired as number}` }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-lg">{{ collection.name }}</span>
                <span class="text-muted-color text-sm">{{ collection.purchasedFrom }}</span>
                <span class="text-muted-color text-sm">{{ new Date(collection.purchased ?? '').toLocaleDateString() }}</span>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-muted-color">
                {{ `${formatCurrency(collection.totalSoldValue as number)} / ${formatCurrency(collection.purchaseCost as number)}` }}
              </span>
              <span
                :class="[
                  'text-lg',
                  (collection.totalSoldValue as number) - (collection.purchaseCost as number) >= 0 ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ `${formatCurrency((collection.totalSoldValue as number) - (collection.purchaseCost as number))}` }}
              </span>
              <i class="pi pi-chevron-right transition-opacity group-hover:opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      <div v-show="!showCollectionSelection">
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <RouterLink class="flex items-center gap-2" :to="{ name: 'inventory' }">
              <i class="pi pi-chevron-left"></i>
              <span class="text-lg font-semibold">{{ collections.find((c) => c.id === collectionId)?.name ?? 'Back' }}</span>
            </RouterLink>
            <Button icon="pi pi-plus" text @click="handleAddCollection" />
          </div>
          <Button icon="pi-trash pi" label="Selected" severity="danger" :disabled="!selectedRows.length" @click="handleDeleteSelected" />
        </div>
        <AgGridVue ref="grid" class="h-[calc(100vh-130px)]" :grid-options :column-defs :row-data="collectionItems" />
      </div>
    </div>
  </div>

  <Dialog v-model:visible="isAddCollectionModalVisible" class="w-xl" modal :header="collectionId ? 'Add to Collection' : 'New Collection'">
    <Form v-slot="$form" ref="form" class="flex flex-col gap-4" :initial-values :resolver @submit="handleSubmit">
      <div v-if="!collectionId" class="flex w-full flex-col gap-1">
        <label for="name" class="ml-3 text-sm">Name</label>
        <InputText name="name" />
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error?.message }}</Message>
      </div>

      <div v-if="!collectionId" class="flex w-full items-center gap-2">
        <div class="flex w-full flex-col gap-1">
          <label for="purchaseCost" class="ml-3 text-sm">Cost</label>
          <IconField>
            <InputIcon class="pi pi-dollar" />
            <InputNumber name="purchaseCost" fluid currency="USD" mode="currency" />
          </IconField>
          <Message v-if="$form.purchaseCost?.invalid" severity="error" size="small" variant="simple">{{ $form.purchaseCost.error?.message }}</Message>
        </div>

        <div class="flex w-full flex-col gap-1">
          <label for="purchasedFrom" class="ml-3 text-sm">Purchased From</label>
          <InputText name="purchasedFrom" />
          <Message v-if="$form.purchasedFrom?.invalid" severity="error" size="small" variant="simple">
            {{ $form.purchasedFrom.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex w-full items-center gap-2">
        <div v-if="!collectionId" :class="`flex ${showListDateInput ? 'w-full' : 'w-1/2 pr-1'} flex-col gap-1`">
          <label for="purchased" class="ml-3 text-sm">Purchase Date</label>
          <InputGroup>
            <DatePicker name="purchased" />
            <InputGroupAddon>
              <Checkbox v-model="showListDateInput" v-tooltip.top="'Specify listing date'" binary />
            </InputGroupAddon>
          </InputGroup>
          <Message v-if="$form.purchased?.invalid" severity="error" size="small" variant="simple">{{ $form.purchased.error?.message }}</Message>
        </div>

        <div v-show="showListDateInput" class="flex w-full flex-col gap-1">
          <label for="listed" class="ml-3 text-sm">List Date</label>
          <DatePicker name="listed" />
          <Message v-if="$form.listed?.invalid" severity="error" size="small" variant="simple">{{ $form.listed.error?.message }}</Message>
        </div>
      </div>

      <div class="dark:border-surface-800 dark:bg-surface-950 flex flex-col gap-4 rounded-md border p-4">
        <div class="flex flex-col gap-2">
          <label for="listPullSheetUpload">List Pull Sheet</label>
          <FileUpload name="listPullSheetUpload" accept=".csv" mode="basic" @select="handleListPullSheetUpload" />
        </div>
        <div class="flex flex-col gap-2">
          <label for="pricingUpload">Pricing</label>
          <FileUpload name="pricingUpload" accept=".csv" mode="basic" @select="handlePricingUpload" />
        </div>
      </div>

      <Button label="Submit" type="submit" :loading="isSubmitLoading" />
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import { useAgGridTheme } from '@/composables/useAgGridTheme';
import router from '@/router';
import { CollectionService } from '@/service/collection-service';
import { Collections, type CollectionItemsResponse, type CollectionStatsRecord, type ProductsRecord } from '@/types/pocketbase-types';
import { formatCurrency } from '@/util/functions';
import pb from '@/util/pocketbase';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { type ColDef, type GridOptions } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import {
  Button,
  DatePicker,
  Dialog,
  FileUpload,
  IconField,
  InputIcon,
  InputNumber,
  InputText,
  Knob,
  Message,
  useToast,
  InputGroup,
  InputGroupAddon,
  Checkbox,
  type FileUploadSelectEvent
} from 'primevue';
import { computed, nextTick, onMounted, reactive, ref, useTemplateRef, watch } from 'vue';

// Types ------------------------------------------------------------------------------
interface FormValues {
  name?: string;
  purchasedFrom?: string;
  purchaseCost?: number;
  purchased?: string;
  listed?: string;
}
type CollectionItemsExpandProduct = CollectionItemsResponse<{ product: ProductsRecord }>;

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ collectionId?: string }>();

// Template Refs ----------------------------------------------------------------------
const grid = ref();
const form = useTemplateRef<FormInstance>('form');

// Variables --------------------------------------------------------------------------
const toast = useToast();
const inventoryService = new CollectionService();
const theme = useAgGridTheme();

const gridOptions: GridOptions<CollectionItemsExpandProduct> = {
  defaultColDef: { filter: true },
  theme: theme.value,
  pagination: true,
  paginationPageSize: 50,
  suppressCellFocus: true,
  rowSelection: { mode: 'multiRow', selectAll: 'filtered' },
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

const columnDefs: ColDef<CollectionItemsExpandProduct>[] = [
  { field: 'expand.product.name', headerName: 'Name', sort: 'asc' },
  { field: 'expand.product.set', headerName: 'Set' },
  { field: 'expand.product.number', headerName: 'Number' },
  { field: 'expand.product.condition', headerName: 'Condition' },
  { field: 'qtyAcquired', headerName: 'Acquired', hide: true },
  { field: 'qtySold', headerName: 'Sold', hide: true },
  {
    headerName: 'Quantity',
    valueGetter: (node) => {
      return (node.data?.qtyAcquired ?? 0) - (node.data?.qtySold ?? 0);
    },
    filter: 'agNumberColumnFilter'
  },
  { field: 'unitCogs', headerName: 'Unit COGS', valueFormatter: (params) => formatCurrency(params.data?.unitCogs) ?? '' },
  {
    field: 'marketPriceAtImport',
    headerName: 'Market Price at Import',
    valueFormatter: (params) => formatCurrency(params.data?.marketPriceAtImport) ?? ''
  },
  {
    headerName: 'List Date',
    field: 'listed',
    valueGetter: (params) => {
      const utc = params.data?.listed as string | undefined;
      if (!utc) return null;
      const d = new Date(utc);
      return Number.isNaN(d.getTime()) ? null : d;
    },
    filter: 'agDateColumnFilter',
    filterParams: {
      comparator: (filterLocalDateAtMidnight: Date, cellValue: unknown) => {
        if (!cellValue) return -1;
        const cellDate = cellValue instanceof Date ? cellValue : new Date(cellValue as string);
        if (Number.isNaN(cellDate.getTime())) return -1;
        const cellMidnight = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
        if (cellMidnight < filterLocalDateAtMidnight) return -1;
        if (cellMidnight > filterLocalDateAtMidnight) return 1;
        return 0;
      }
    },
    valueFormatter: (params) => {
      const v = params.value as Date | null;
      if (!v) return '';
      return v.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    }
  }
];

// Reactive Variables -----------------------------------------------------------------
const collections = ref<CollectionStatsRecord[]>([]);

const isAddCollectionModalVisible = ref(false);
const showCollectionSelection = computed(() => !props.collectionId);
const showListDateInput = ref(false);
const isSubmitLoading = ref(false);

const initialValues = reactive({
  name: '',
  purchasedFrom: '',
  purchaseCost: null,
  purchased: '',
  listed: ''
});
const listPullSheet = ref();
const pricing = ref();

const collectionItems = ref([]);

const selectedRows = ref<CollectionItemsExpandProduct[]>([]);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------
watch(
  () => props.collectionId,
  async (newValue) => {
    if (newValue && newValue != '') {
      collectionItems.value = await pb.collection(Collections.CollectionItems).getFullList({ filter: `collection="${newValue}"`, expand: 'product' });
    }
  },
  { immediate: true }
);

// Methods ----------------------------------------------------------------------------
const refreshCollectionItems = async (collectionId: string) => {
  collectionItems.value = await pb.collection(Collections.CollectionItems).getFullList({ filter: `collection="${collectionId}"`, expand: 'product' });
};

const handleScan = async (collectionId?: string) => {
  if (!collectionId) {
    await inventoryService.scanForSoldCards();
    toast.add({
      severity: 'success',
      summary: 'Scan Complete',
      life: 3000
    });
  } else {
    const results = await inventoryService.scanForSoldCardsForCollection(collectionId);
    toast.add({
      severity: 'success',
      summary: 'Scan Complete',
      detail: `Updated ${results.itemsUpdated} collection items.\nUpdated ${results.ordersUpdated} order items.\nAssigned ${results.unitsAssigned} units.`,
      life: 3000
    });
    await refreshCollectionItems(props.collectionId ?? '');
  }
  collections.value = await pb.collection(Collections.CollectionStats).getFullList();
};

const handleUpdateUnitCogs = async (collectionId: string) => {
  await inventoryService.updateCogs(collectionId);
  toast.add({ severity: 'success', summary: 'Unit COGS Refreshed', life: 3000 });
};

const handleResetAllocations = async () => {
  const allItems = await pb.collection(Collections.CollectionItems).getFullList();
  const allOrderItems = await pb.collection(Collections.OrderItems).getFullList({ filter: 'collectionItem != null' });

  const batch = pb.createBatch();

  for (const item of allItems) {
    batch.collection(Collections.CollectionItems).update(item.id, { qtySold: 0 });
  }

  for (const item of allOrderItems) {
    batch.collection(Collections.OrderItems).update(item.id, { collectionItem: null });
  }

  await batch.send();
  toast.add({ severity: 'success', summary: 'Allocations Reset', detail: 'Order and collection items were reset.', life: 3000 });
  collections.value = await pb.collection(Collections.CollectionStats).getFullList();
};

const handleCollectionSelect = (collectionId: string) => {
  router.push({ name: 'inventory', params: { collectionId } });
};

const handleAddCollection = () => {
  isAddCollectionModalVisible.value = true;

  if (props.collectionId) {
    showListDateInput.value = true;
  } else {
    showListDateInput.value = false;
  }
};

const handleListPullSheetUpload = (event: FileUploadSelectEvent) => {
  listPullSheet.value = event.files[0];
};

const handlePricingUpload = (event: FileUploadSelectEvent) => {
  pricing.value = event.files[0];
};

const resolver = ({ values }: { values: FormValues }) => {
  const errors: Record<string, { message: string }[]> = {};

  if (!props.collectionId && !values.name) {
    errors.name = [{ message: 'Name is required' }];
  }

  if (!props.collectionId && !values.purchasedFrom) {
    errors.purchasedFrom = [{ message: 'Purchased from is required' }];
  }

  if (!props.collectionId && !values.purchaseCost) {
    errors.purchaseCost = [{ message: 'Purchase cost is required' }];
  }

  if (!props.collectionId && !values.purchased) {
    errors.purchased = [{ message: 'Purchase date is required' }];
  }

  if (showListDateInput.value) {
    if (!values.listed) {
      errors.listed = [{ message: 'List date is required' }];
    } else if (!props.collectionId && values.purchased && new Date(values.listed).getTime() < new Date(values.purchased).getTime()) {
      errors.listed = [{ message: 'List date must be after purchase date' }];
    }
  }

  return {
    values,
    errors
  };
};

const handleSubmit = async (event: FormSubmitEvent) => {
  if (event.valid) {
    isSubmitLoading.value = true;

    if (event.values.id) {
      await pb.collection(Collections.Collections).update(event.values.id, event.values);
    } else {
      let collectionId = props.collectionId;
      if (!props.collectionId) {
        collectionId = (await pb.collection(Collections.Collections).create({ store: pb.authStore.record?.store, ...event.values })).id;
      }
      // TODO add additional field to specify listing date
      await inventoryService.addToCollection(
        collectionId!,
        showListDateInput.value ? event.values.listed : event.values.purchased,
        listPullSheet.value,
        pricing.value
      );
      await inventoryService.updateCogs(collectionId!);
    }

    event.reset();
    collections.value = await pb.collection(Collections.CollectionStats).getFullList();
    if (props.collectionId) await refreshCollectionItems(props.collectionId);
    isSubmitLoading.value = false;
    isAddCollectionModalVisible.value = false;
  }
};

const handleDeleteSelected = async () => {
  const batch = pb.createBatch();

  for (const selectedRow of selectedRows.value) {
    batch.collection(Collections.CollectionItems).delete(selectedRow.id);
  }

  await batch.send();
  toast.add({ severity: 'success', summary: 'Inventory Items Deleted', detail: 'Selected inventory items were deleted successfully.', life: 3000 });
  selectedRows.value = [];
  if (props.collectionId) await refreshCollectionItems(props.collectionId);
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  collections.value = await pb.collection(Collections.CollectionStats).getFullList();

  if (import.meta.env.DEV) {
    const pullResponse = await fetch('/TCGplayer_ManageLists_PullSheet.csv');
    const pricingResponse = await fetch('/TCGplayer__MyPricing.csv');

    const pullBlob = await pullResponse.blob();
    const pricingBlob = await pricingResponse.blob();

    const pullFile = new File([pullBlob], 'PullSheet.csv', { type: pullBlob.type });
    const pricingFile = new File([pricingBlob], 'Pricing.csv', { type: pricingBlob.type });

    listPullSheet.value = pullFile;
    pricing.value = pricingFile;
  }
});
</script>
