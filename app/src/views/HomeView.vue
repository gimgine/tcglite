<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Profit" :details="totalProfit(orderStore.orders)" :change="totalProfit(orderStore.orders, true)" is-currency />
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Gross Sales" :details="grossSales(orderStore.orders)" :change="grossSales(orderStore.orders, true)" is-currency />
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator
        label="Orders"
        :details="orderStore.orders.length"
        :change="orderStore.orders.filter((o) => isToday(new Date(o.created ?? ''))).length"
      />
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator
        label="Last Updated"
        :details="new Date(Math.max(...orderStore.orders.map((order) => new Date(order.created!).getTime()))).toLocaleString()"
      />
    </div>

    <div class="col-span-12">
      <div class="dark:bg-surface-900 dark:border-surface-700 rounded-md border border-gray-200 bg-white p-8 shadow">
        <div class="mb-2 flex items-center justify-between">
          <div class="flex flex-col gap-4 md:flex-row md:items-center">
            <span class="text-lg">Order Profits</span>
          </div>
          <div class="flex gap-2">
            <FileUpload mode="basic" choose-label="Check Orders" choose-icon="pi pi-search" accept=".csv" auto @select="handleCheckOrdersCsvClick" />
            <FileUpload
              mode="basic"
              choose-label="Pull Sheet"
              choose-icon="pi pi-file-arrow-up"
              accept=".csv"
              auto
              @select="handlePullSheetCsvClick"
            />
            <FileUpload mode="basic" choose-label="Shipping Export" choose-icon="pi pi-file-arrow-up" accept=".csv" auto @select="handleCsvClick" />
          </div>
        </div>
        <ag-grid-vue ref="grid" class="h-[calc(100vh-270px)]" :grid-options :column-defs :row-data="orderStore.orders" />
      </div>
    </div>
  </div>

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
import { CardService } from '@/service/card-service';
import { OrderService } from '@/service/order-service';
import { useOrderStore } from '@/store/order-store';
import { type OrdersRecord } from '@/types/pocketbase-types';
import { parseShippingCsv, type ShippingCsv } from '@/util/csv-parse';
import { formatCurrency, isToday } from '@/util/functions';
import {
  type CellClassParams,
  type ColDef,
  type GridOptions,
  type ICellRendererParams,
  type ValueFormatterParams,
  type ValueGetterParams
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import { Dialog, FileUpload, type FileUploadSelectEvent, useToast } from 'primevue';
import { computed, nextTick, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const grid = ref();

// Variables --------------------------------------------------------------------------
const orderService = new OrderService();
const orderStore = useOrderStore();
const theme = useAgGridTheme();

const cardService = new CardService();

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
    sort: 'desc'
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
const handleCsvClick = async (event: FileUploadSelectEvent) => {
  // TODO check batch response and see if we can return the amount of records added
  orderService
    .create({ file: event.files[0] })
    .then(() => {
      orderStore.refresh();
      toast.add({
        severity: 'success',
        summary: 'Orders Added',
        detail: `New orders were added.`,
        life: 3000
      });
    })
    .catch((error: Error) => {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000
      });
    });
};

const handlePullSheetCsvClick = async (event: FileUploadSelectEvent) => {
  cardService
    .create({ file: event.files[0] })
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Cards Added',
        detail: `New cards were added.`,
        life: 3000
      });
    })
    .catch((error: Error) => {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000
      });
    });
};

const handleCheckOrdersCsvClick = async (event: FileUploadSelectEvent) => {
  const shippingCsv = await parseShippingCsv(event.files[0]);
  isCheckModalVisible.value = true;
  checkingOrders.value = shippingCsv;
};

const totalProfit = (orders: OrdersRecord[], today?: boolean) => {
  return orders.filter((order) => !today || isToday(new Date(order.created ?? ''))).reduce((sum, order) => sum + (order.profit ?? 0), 0);
};

const grossSales = (orders: OrdersRecord[], today?: boolean) => {
  const filtered = orders.filter((order) => !today || isToday(new Date(order.created ?? '')));

  const sales = filtered.reduce((sum, order) => sum + (order.totalPrice ?? 0), 0);
  const fees = filtered.reduce((sum, order) => sum + (order.vendorFee ?? 0) + (order.processingFee ?? 0), 0);

  return sales - fees;
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

// Lifecycle Hooks --------------------------------------------------------------------
</script>
