<template>
  <div class="grid h-screen grid-cols-12 gap-4">
    <!-- left col -->
    <div class="dark:border-surface-700 dark:bg-surface-900 col-span-2 rounded-md border border-gray-200 bg-white p-6 shadow">
      <div class="flex h-full flex-col justify-between gap-4">
        <div class="flex h-full flex-col gap-4">
          <span class="text-2xl font-semibold">Inventory</span>
          <Button label="View Full Inventory" @click="$router.push({ name: 'inventory', params: { collectionId: 'full' } })" />
          <div class="flex items-center gap-2">
            <Checkbox v-model="showZeroQuantity" binary name="showZeroQuantity" />
            <label for="showZeroQuantity">Zero Quantity</label>
          </div>
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
            <div class="flex gap-4 transition-opacity group-hover:opacity-50">
              <Knob :model-value="50" :size="75" value-template="{value}%" readonly></Knob>
              <div class="flex flex-col">
                <span class="text-lg">{{ collection.name }}</span>
                <span class="text-muted-color text-sm">{{ collection.purchasedFrom }}</span>
                <span class="text-muted-color text-sm">{{ new Date(collection.purchased ?? '').toLocaleDateString() }}</span>
              </div>
            </div>
            <i class="pi pi-chevron-right transition-opacity group-hover:opacity-50"></i>
          </div>
        </div>
      </div>

      <div v-show="!showCollectionSelection">
        <AgGridVue ref="grid" class="h-[calc(100vh-82px)]" :grid-options :column-defs :row-data="filteredInventoryItems" />
      </div>
    </div>
  </div>

  <Dialog v-model:visible="isAddCollectionModalVisible" modal header="New Collection">
    <Form v-slot="$form" ref="form" class="flex flex-col gap-4" :initial-values :resolver @submit="handleSubmit">
      <div class="flex w-full flex-col gap-1">
        <label for="name" class="ml-3 text-sm">Name</label>
        <InputText name="name" />
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error?.message }}</Message>
      </div>

      <div class="flex w-full items-center gap-2">
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

      <div class="flex w-1/2 flex-col gap-1 pr-1">
        <label for="purchased" class="ml-3 text-sm">Purchase Date</label>
        <IconField>
          <InputIcon class="pi pi-calendar" />
          <DatePicker name="purchased" />
        </IconField>
        <Message v-if="$form.purchased?.invalid" severity="error" size="small" variant="simple">{{ $form.purchased.error?.message }}</Message>
      </div>

      <div class="flex items-center gap-2">
        <Checkbox v-model="fromNewProducts" binary name="fromNewProducts" />
        <label for="fromNewProducts">From New Products</label>
      </div>

      <div class="dark:border-surface-800 dark:bg-surface-950 flex flex-col gap-4 rounded-md border p-4">
        <div class="flex flex-col gap-2">
          <label for="listPullSheetUpload">List Pull Sheet</label>
          <FileUpload name="listPullSheetUpload" accept=".csv" mode="basic" @select="handleListPullSheetUpload" />
        </div>
        <div v-show="fromNewProducts" class="flex flex-col gap-2">
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
import { useInventoryStore, type InventoryItemsExpandProduct } from '@/store/inventory-store';
import { Collections, type CollectionsRecord } from '@/types/pocketbase-types';
import { formatCurrency } from '@/util/functions';
import pb from '@/util/pocketbase';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { type ColDef, type GridOptions } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import {
  Button,
  Checkbox,
  Dialog,
  InputText,
  FileUpload,
  Message,
  Knob,
  IconField,
  InputIcon,
  InputNumber,
  DatePicker,
  type FileUploadSelectEvent
} from 'primevue';
import { computed, nextTick, onMounted, reactive, ref, useTemplateRef } from 'vue';
// Types ------------------------------------------------------------------------------
interface FormValues {
  name?: string;
  purchasedFrom?: string;
  purchaseCost?: number;
  purchased?: string;
}

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ collectionId?: string }>();

// Template Refs ----------------------------------------------------------------------
const grid = ref();
const form = useTemplateRef<FormInstance>('form');

// Variables --------------------------------------------------------------------------
const inventoryStore = useInventoryStore();
const theme = useAgGridTheme();

const gridOptions: GridOptions<InventoryItemsExpandProduct> = {
  defaultColDef: { filter: true },
  theme: theme.value,
  pagination: true,
  paginationPageSize: 50,
  suppressCellFocus: true,
  onModelUpdated: (e) => {
    e.api.autoSizeAllColumns();
    nextTick(() => {
      if (e.api.getAllDisplayedColumnGroups()!.reduce((acc, c) => acc + c.getActualWidth(), 0) < grid.value?.$el.clientWidth) {
        e.api.sizeColumnsToFit();
      }
    });
  }
};

const columnDefs: ColDef<InventoryItemsExpandProduct>[] = [
  { field: 'expand.product.name', headerName: 'Name' },
  { field: 'expand.product.number', headerName: 'Number' },
  { field: 'expand.product.set', headerName: 'Set' },
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
    headerName: 'Acquired',
    field: 'acquired',
    valueGetter: (params) => {
      const utc = params.data?.acquired as string | undefined;
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
const collections = ref<CollectionsRecord[]>([]);

const isAddCollectionModalVisible = ref(false);
const fromNewProducts = ref(false);
const showCollectionSelection = computed(() => !props.collectionId);
const showZeroQuantity = ref(false);
const isSubmitLoading = ref(false);

const initialValues = reactive({
  name: '',
  purchasedFrom: '',
  purchaseCost: null,
  purchased: ''
});
const listPullSheet = ref();
const pricing = ref();

const filteredInventoryItems = computed(() => {
  const items = inventoryStore.inventory ?? [];

  const wantAllCollections = !props.collectionId || props.collectionId === 'full';
  const wantAllQty = showZeroQuantity.value;

  return items.filter((item) => {
    if (!wantAllCollections && String(item.collection) !== String(props.collectionId)) {
      return false;
    }

    if (!wantAllQty) {
      const remaining = Number(item.qtyAcquired ?? 0) - Number(item.qtySold ?? 0);
      if (remaining <= 0) return false;
    }

    return true;
  });
});

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handleCollectionSelect = (collectionId: string) => {
  router.push({ name: 'inventory', params: { collectionId } });
};

const handleAddCollection = () => {
  isAddCollectionModalVisible.value = true;
};

const handleListPullSheetUpload = (event: FileUploadSelectEvent) => {
  listPullSheet.value = event.files[0];
};

const handlePricingUpload = (event: FileUploadSelectEvent) => {
  pricing.value = event.files[0];
};

const resolver = ({ values }: { values: FormValues }) => {
  const errors: Record<string, { message: string }[]> = {};

  if (!values.name) {
    errors.name = [{ message: 'Name is required' }];
  }

  if (!values.purchasedFrom) {
    errors.purchasedFrom = [{ message: 'Purchased from is required' }];
  }

  if (!values.purchaseCost) {
    errors.purchaseCost = [{ message: 'Purchase cost is required' }];
  }

  if (!values.purchased) {
    errors.purchased = [{ message: 'Purchase date is required' }];
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
      await pb.collection(Collections.Collections).create({ store: pb.authStore.record?.store, ...event.values });
    }

    event.reset();
    collections.value = await pb.collection(Collections.Collections).getFullList();
    isSubmitLoading.value = false;
    isAddCollectionModalVisible.value = false;
  }
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  inventoryStore.refresh();
  collections.value = await pb.collection(Collections.Collections).getFullList();
  isAddCollectionModalVisible.value = true; //remove
});
</script>
