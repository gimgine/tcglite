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
      <div class="rounded-md bg-white p-4 pt-0">
        <DataTable
          v-model:expanded-rows="expandedRows"
          :value="orderStore.orders"
          sort-field="orderDate"
          :sort-order="-1"
          removable-sort
          filter-display="menu"
          data-key="orderNumber"
          striped-rows
          paginator
          :rows="10"
          :rows-per-page-options="[10, 25, 50, 100, 500]"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-4 md:flex-row md:items-center">
                <span class="text-lg">Order Profits</span>
              </div>
              <div>
                <FileUpload mode="basic" choose-label="Shipping CSV" choose-icon="pi pi-file-arrow-up" accept=".csv" auto @select="handleCsvClick" />
              </div>
            </div>
          </template>
          <Column expander />
          <Column field="orderNumber" header="Order Number" sortable />
          <Column field="firstName" header="First Name" sortable />
          <Column field="lastName" header="Last Name" sortable />
          <Column field="orderDate" header="Order Date" sortable>
            <template #body="slotProps">
              {{ new Date(slotProps.data.orderDate).toLocaleDateString() }}
            </template>
          </Column>
          <Column field="itemCount" header="Item Count" sortable />
          <Column field="totalPrice" header="Total Price" sortable>
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.totalPrice) }}
            </template>
          </Column>
          <Column header="Fees">
            <template #body="slotProps">
              <span class="text-orange-600">
                {{ formatCurrency(slotProps.data.processingFee + slotProps.data.vendorFee) }}
              </span>
            </template>
          </Column>
          <Column field="cogs" header="COGS" sortable>
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.cogs) }}
            </template>
          </Column>
          <Column field="shippingCost" header="Shipping" sortable>
            <template #body="slotProps">
              <span
                :class="`rounded-sm px-2 py-0.5 text-xs font-bold ${slotProps.data.shippingCost === orderService.TRACKING.cost ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600'}`"
              >
                {{ getShippingMethod(slotProps.data.shippingCost)?.name }}
              </span>
            </template>
          </Column>
          <Column field="profit" header="Profit/Loss" sortable>
            <template #body="slotProps">
              <span :class="slotProps.data.profit > 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(slotProps.data.profit) }}
              </span>
            </template>
          </Column>

          <template #expansion="slotProps">
            <div>
              <span>{{ slotProps.data.orderNumber }}</span>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>

  <ShippingModal ref="shippingModal" :orders="shippingFlaggedOrders" @submit="handleSubmitClick" />
</template>

<script setup lang="ts">
import ShippingModal from '@/components/ShippingModal.vue';
import StatIndicator from '@/components/StatIndicator.vue';
import { OrderService } from '@/service/order-service';
import { useOrderStore } from '@/store/order-store';
import type { ShippingCsvRecord } from '@/types';
import { type OrdersRecord } from '@/types/pocketbase-types';
import { formatCurrency, isToday } from '@/util/functions';
import { Column, DataTable, FileUpload, type FileUploadSelectEvent, useToast } from 'primevue';
import { computed, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const shippingModal = ref({} as InstanceType<typeof ShippingModal>);

// Variables --------------------------------------------------------------------------
const QUESTIONABLE_TRACKING_THRESHOLD = 20;

const orderService = new OrderService();
const orderStore = useOrderStore();

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const shippingMethods = ref<{ cost: number; name: string }[]>([orderService.ENVELOPE, orderService.TRACKING]);

const expandedRows = ref({});

const newOrders = ref<ShippingCsvRecord[]>([]);
const shippingFlaggedOrders = computed(() => newOrders.value.filter((o) => o.productValue + o.shippingFee > QUESTIONABLE_TRACKING_THRESHOLD));

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handleCsvClick = async (event: FileUploadSelectEvent) => {
  const convertedOrders = await orderService.convertCsv(event.files[0]);
  newOrders.value = convertedOrders;

  if (shippingFlaggedOrders.value.length > 0) {
    shippingModal.value.open();
    return;
  }

  orderService.create(convertedOrders).then(() => {
    orderStore.refresh();
    toast.add({
      severity: 'success',
      summary: 'Orders Added',
      detail: `${convertedOrders.length} new orders were added.`,
      life: 3000
    });
  });
};

const handleSubmitClick = () => {
  shippingModal.value.toggleSubmitLoading();

  shippingFlaggedOrders.value.forEach((o) => orderService.setOrderFinancial(o));

  orderService
    .create(newOrders.value)
    .then(() => {
      shippingModal.value.close();
      orderStore.refresh();
      toast.add({
        severity: 'success',
        summary: 'Orders Added',
        detail: `${newOrders.value.length} orders were added.`,
        life: 3000
      });
    })
    .finally(() => {
      shippingModal.value.toggleSubmitLoading();
    });
};

const getShippingMethod = (shippingCost: number) => {
  return shippingMethods.value.find((sm) => sm.cost === shippingCost);
};

const totalProfit = (orders: OrdersRecord[], today?: boolean) => {
  return orders.filter((order) => !today || isToday(new Date(order.created ?? ''))).reduce((sum, order) => sum + (order.profit ?? 0), 0);
};

const grossSales = (orders: OrdersRecord[], today?: boolean) => {
  return orders.filter((order) => !today || isToday(new Date(order.created ?? ''))).reduce((sum, order) => sum + (order.totalPrice ?? 0), 0);
};

// Lifecycle Hooks --------------------------------------------------------------------
</script>
