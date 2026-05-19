<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 flex w-full items-center">
      <h1 class="w-32">Order Quota</h1>
      <ProgressBar class="w-full" :value="(orderStore.orderStats?.quotaCompletion! / (preferencesStore.preferences?.switchGoal ?? 1)) * 100">
        {{ orderStore.orderStats?.quotaCompletion }} / {{ preferencesStore.preferences?.switchGoal }}
      </ProgressBar>
      <Button class="ml-2" size="small" text icon="pi pi-refresh" @click="handleOpenSwitchPopover"></Button>
      <Popover ref="popover">
        <div class="flex flex-col gap-2">
          <label for="possessionDate" class="ml-3 text-sm">Date of Possession</label>
          <DatePicker v-model="formPossessionDate" name="possessionDate" show-time hour-format="12"></DatePicker>
          <Button size="small" class="ml-auto" :loading="isSwitchButtonLoading" @click="handleSwitchClick">Save</Button>
        </div>
      </Popover>
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Profit" :details="orderStore.orderStats?.profit" :change="orderStore.orderStats?.todayProfit" is-currency />
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Gross Sales" :details="orderStore.orderStats?.grossSales" :change="orderStore.orderStats?.todayGrossSales" is-currency />
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Orders" :details="orderStore.orderStats?.orderCount" :change="orderStore.orderStats?.todayOrderCount" />
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Last Updated" :details="new Date(orderStore.orderStats?.lastUpdated ?? '').toLocaleString()" />
    </div>

    <div class="col-span-12">
      <div class="dark:bg-surface-900 dark:border-surface-700 rounded-md border border-gray-200 bg-white p-8 shadow">
        <div class="mb-2 flex items-center justify-between">
          <div class="flex flex-col gap-4 md:flex-row md:items-center">
            <span class="text-lg">Order Profits</span>
          </div>
          <div class="flex gap-2">
            <FileUpload
              v-tooltip.left="'Upload a shipping export to see an overview of the selected orders'"
              mode="basic"
              choose-label="Check Orders"
              choose-icon="pi pi-search"
              accept=".csv"
              auto
              @select="handleCheckOrdersCsvClick"
            />
            <Button icon="pi pi-file-arrow-up" label="Upload Orders" @click="isUploadModalVisible = true" />
          </div>
        </div>
        <AgGridVue
          ref="grid"
          class="h-[calc(100vh-319px)]"
          :grid-options
          :column-defs
          :row-data="orderStore.orders"
          :loading="orderStore.isOrdersLoading"
        />
      </div>
    </div>
  </div>

  <Dialog v-model:visible="isUploadModalVisible" header="Upload Orders" modal>
    <div class="flex h-full w-lg flex-col justify-between">
      <div class="mb-4 flex flex-col items-start gap-8">
        <div>
          <div class="mb-2">Pull Sheet</div>
          <FileUpload accept=".csv" mode="basic" @select="handlePullSheetUpload" />
        </div>
        <div>
          <div class="mb-2">Shipping Export</div>
          <FileUpload ref="fileUpload" accept=".csv" mode="basic" @select="handleShippingExportUpload" />
        </div>
      </div>
      <div class="flex w-full flex-col items-end">
        <Button label="Upload" icon="pi pi-file-arrow-up" :loading="isUploadLoading" :disabled="!pullSheet" @click="handleOrdersUpload" />
      </div>
    </div>
  </Dialog>

  <Dialog v-model:visible="isCheckModalVisible" header="Orders Stats" position="topright">
    <div class="grid grid-cols-6 grid-rows-2 gap-x-10 gap-y-5">
      <div class="col-span-2 flex flex-col">
        <span class="text-sm text-gray-500">Orders</span>
        <span>{{ checkingOrders.length }}</span>
      </div>
      <div class="col-span-2 flex flex-col">
        <span class="text-sm text-gray-500">Gross Sales</span>
        <span>{{ formatCurrency(csvGrossSales(checkingOrders)) }}</span>
      </div>
      <div class="col-span-2 flex flex-col">
        <span class="text-sm text-gray-500">Cards Sold</span>
        <span>{{ checkingOrders.reduce((sum, order) => sum + order['Item Count'], 0) }}</span>
      </div>
      <div class="col-span-3 flex flex-col">
        <span class="text-sm text-gray-500">Highest Value</span>
        <span>
          <i>{{ highestValueOrder?.FirstName }} {{ highestValueOrder?.LastName }}</i> {{ formatCurrency(highestValueOrder?.['Value Of Products']) }}
        </span>
      </div>
      <div class="col-span-3 flex flex-col">
        <span class="text-sm text-gray-500">Largest Order</span>
        <span>
          <i>{{ largestOrder?.FirstName }} {{ largestOrder?.LastName }}</i> {{ largestOrder?.['Item Count'] }}
        </span>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import StatIndicator from '@/components/StatIndicator.vue';
import { useAgGridTheme } from '@/composables/useAgGridTheme';
import { CollectionService } from '@/service/collection-service';
import { OrderItemService } from '@/service/order-item-service';
import { OrderService } from '@/service/order-service';
import { StorePreferencesService } from '@/service/store-preferences-service';
import { useOrderStore } from '@/store/order-store';
import { usePreferencesStore } from '@/store/preferences-store';
import { type OrdersRecord } from '@/types/pocketbase-types';
import { parseShippingCsv, type ShippingCsv } from '@/util/csv-parse';
import { formatCurrency } from '@/util/functions';
import pb from '@/util/pocketbase';
import {
  type CellClassParams,
  type ColDef,
  type GridOptions,
  type ICellRendererParams,
  type ValueFormatterParams,
  type ValueGetterParams
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import { Button, DatePicker, Dialog, FileUpload, Popover, ProgressBar, useToast, type FileUploadSelectEvent } from 'primevue';
import { computed, nextTick, onMounted, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const grid = ref();
const popover = ref({} as InstanceType<typeof Popover>);

// Variables --------------------------------------------------------------------------
const orderService = new OrderService();
const orderStore = useOrderStore();
const preferencesStore = usePreferencesStore();
const theme = useAgGridTheme();

const orderItemService = new OrderItemService();
const collectionService = new CollectionService();
const storePreferencesService = new StorePreferencesService();

const gridOptions: GridOptions<OrdersRecord> = {
  theme: theme.value,
  defaultColDef: { filter: true },
  pagination: true,
  paginationPageSize: 20,
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
const columnDefs: ColDef<OrdersRecord>[] = [
  { field: 'id', headerName: 'Order Number' },
  { field: 'firstName', headerName: 'First Name' },
  { field: 'lastName', headerName: 'Last Name' },
  {
    field: 'orderDate',
    headerName: 'Order Date',
    valueFormatter: (params: ValueFormatterParams) => new Date(params.data.orderDate).toLocaleDateString(),
    sort: 'desc',
    comparator: (a, b) => {
      const timeA = a ? new Date(a).getTime() : Infinity;
      const timeB = b ? new Date(b).getTime() : Infinity;
      return timeA - timeB;
    }
  },
  { field: 'itemCount', maxWidth: 150 },
  { field: 'totalPrice', maxWidth: 150, valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data.totalPrice) ?? '' },
  {
    headerName: 'Fees',
    cellClass: 'text-orange-600',
    maxWidth: 120,
    valueGetter: (params: ValueGetterParams) => (params.data.processingFee ?? 0) + (params.data.vendorFee ?? 0),
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data.processingFee + params.data.vendorFee) ?? ''
  },
  { field: 'cogs', headerName: 'COGS', maxWidth: 120, valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data.cogs) ?? '' },
  {
    field: 'shippingCost',
    headerName: 'Shipping',
    maxWidth: 150,
    cellRenderer: (
      params: ICellRendererParams
    ) => `<span title="${formatCurrency(params.data.shippingCost)}" class="rounded-sm px-2 py-0.5 text-xs font-bold ${params.data.isTracking ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600'}">
            ${getShippingMethodDescription(params.data.packageOunces, params.data.isTracking)}
          </span>`
  },
  {
    field: 'profit',
    maxWidth: 150,
    cellClass: (params: CellClassParams) => (params.data.profit > 0 ? 'text-green-600' : 'text-red-600'),
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data.profit) ?? ''
  }
];

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const isCheckModalVisible = ref(false);
const checkingOrders = ref<ShippingCsv[]>([]);

const isUploadModalVisible = ref(false);
const isUploadLoading = ref(false);
const pullSheet = ref();
const shippingExport = ref();

const possessionDate = ref();
const formPossessionDate = ref();
const isSwitchButtonLoading = ref();

const highestValueOrder = computed(() => {
  if (checkingOrders.value.length === 0) return null;
  return checkingOrders.value.reduce((max, order) => (order['Value Of Products'] > max['Value Of Products'] ? order : max));
});

const largestOrder = computed(() => {
  if (checkingOrders.value.length === 0) return null;
  return checkingOrders.value.reduce((max, order) => (order['Item Count'] > max['Item Count'] ? order : max));
});

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handleOrdersUpload = async () => {
  isUploadLoading.value = true;

  try {
    if (shippingExport.value) {
      await orderService.create({ file: shippingExport.value });
    }

    if (pullSheet.value) {
      await orderItemService.create({ file: pullSheet.value });
      await collectionService.scanForSoldCards();
    }

    toast.add({
      severity: 'success',
      summary: 'Orders Uploaded',
      detail: 'Orders/order contents were successfully uploaded to the server.',
      life: 3000
    });

    isUploadModalVisible.value = false;
    orderStore.refresh();
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: (error as Error).message,
      life: 3000
    });
  } finally {
    isUploadLoading.value = false;
  }
};

const handleOpenSwitchPopover = (event: Event) => {
  popover.value.toggle(event);
};

const handleSwitchClick = async (event: Event) => {
  if (!formPossessionDate.value || !pb.authStore.record?.id) {
    return;
  }

  isSwitchButtonLoading.value = true;
  await storePreferencesService.update({ id: preferencesStore.preferences!.id, possessionDate: formPossessionDate.value });
  possessionDate.value = new Date(formPossessionDate.value);
  isSwitchButtonLoading.value = false;
  popover.value.toggle(event);
};

const handleCheckOrdersCsvClick = async (event: FileUploadSelectEvent) => {
  const shippingCsv = await parseShippingCsv(event.files[0]);
  isCheckModalVisible.value = true;
  checkingOrders.value = shippingCsv;
};

const csvGrossSales = (orders: ShippingCsv[]) => {
  const totalPrice = (order: ShippingCsv) => order['Value Of Products'] + order['Shipping Fee Paid'];
  const vendorFee = (order: ShippingCsv) => totalPrice(order) * 0.1025;
  const processingFee = (order: ShippingCsv) => totalPrice(order) * 0.025 + 0.3;

  const sales = orders.reduce((sum, order) => sum + totalPrice(order), 0);
  const fees = orders.reduce((sum, order) => sum + vendorFee(order) + processingFee(order), 0);

  return sales - fees;
};

const getShippingMethodDescription = (packageOunces: number, isTracking: boolean) => {
  return `${isTracking ? '' : `${packageOunces === -1 ? '>3' : packageOunces}oz `}${isTracking ? 'Tracking' : 'Envelope'}`;
};

const handlePullSheetUpload = (event: FileUploadSelectEvent) => {
  pullSheet.value = event.files[0];
};

const handleShippingExportUpload = (event: FileUploadSelectEvent) => {
  shippingExport.value = event.files[0];
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  await preferencesStore.refresh();
  possessionDate.value = formPossessionDate.value = preferencesStore.preferences?.possessionDate
    ? new Date(preferencesStore.preferences?.possessionDate)
    : undefined;
});
</script>
