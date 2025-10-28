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
            <Button icon="pi pi-plus" text rounded />
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
</template>

<script setup lang="ts">
import { useAgGridTheme } from '@/composables/useAgGridTheme';
import router from '@/router';
import { useInventoryStore, type InventoryItemsExpandProduct } from '@/store/inventory-store';
import { Collections, type CollectionsRecord } from '@/types/pocketbase-types';
import { formatCurrency } from '@/util/functions';
import pb from '@/util/pocketbase';
import { type ColDef, type GridOptions } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import { Button, InputText, Knob, Checkbox } from 'primevue';
import { computed, nextTick, onMounted, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ collectionId?: string }>();

// Template Refs ----------------------------------------------------------------------
const grid = ref();

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

const showCollectionSelection = computed(() => props.collectionId === '');
const showZeroQuantity = ref(false);

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

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  inventoryStore.refresh();
  collections.value = await pb.collection(Collections.Collections).getFullList();
});
</script>
