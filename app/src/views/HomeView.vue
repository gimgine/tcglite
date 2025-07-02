<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Profit" :details="totalProfit(orders)" :change="totalProfit(orders, true)" is-currency />
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Gross Sales" :details="grossSales(orders)" :change="grossSales(orders, true)" is-currency />
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Orders" :details="orders.length" :change="orders.filter((o) => isToday(new Date(o.created ?? ''))).length" />
    </div>

    <div class="col-span-12 md:col-span-3">
      <StatIndicator
        label="Last Updated"
        :details="new Date(Math.max(...orders.map((order) => new Date(order.created!).getTime()))).toLocaleString()"
      />
    </div>

    <div class="col-span-12">
      <div class="rounded-md bg-white p-4 pt-0">
        <DataTable
          v-model:expanded-rows="expandedRows"
          :value="orders"
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
                :class="`rounded-sm px-2 py-0.5 text-xs font-bold ${slotProps.data.shippingCost === TRACKING.cost ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600'}`"
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
import type { OrderCsvRecord } from '@/types';
import { Collections, type OrdersRecord } from '@/types/pocketbase-types';
import { parseShippingCsv } from '@/util/csv-parse';
import { formatCurrency, isToday } from '@/util/functions';
import pb from '@/util/pocketbase';
import { Column, DataTable, FileUpload, type FileUploadSelectEvent, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const shippingModal = ref({} as InstanceType<typeof ShippingModal>);

// Variables --------------------------------------------------------------------------
const ENVELOPE = { cost: 1, name: 'Envelope' };
const TRACKING = { cost: 5, name: 'Tracking' };

const QUESTIONABLE_TRACKING_THRESHOLD = 20;
const TRACKING_THRESHOLD = 30;

const TEMP_COGS = 0.26;

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const orders = ref<OrdersRecord[]>([]);
const shippingMethods = ref<{ cost: number; name: string }[]>([ENVELOPE, TRACKING]);

const expandedRows = ref({});

const newOrders = ref<OrderCsvRecord[]>([]);
const shippingFlaggedOrders = computed(() => newOrders.value.filter((o) => o.productValue + o.shippingFee > QUESTIONABLE_TRACKING_THRESHOLD));

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const parseOrderCsv = async (file: File) => {
  const parsed = await parseShippingCsv(file);

  newOrders.value = [];
  for (const row of parsed) {
    const [year, month, day] = (row['Order Date'] ?? '0000-00-00').split('-');
    const newOrder: OrderCsvRecord = {
      orderNumber: row['Order #'],
      firstName: row.FirstName,
      lastName: row.LastName,
      address: row.Address1,
      addressTwo: row.Address2,
      city: row.City,
      state: row.State,
      postalCode: row.PostalCode,
      country: row.Country,
      orderDate: new Date(Date.UTC(+year, +month - 1, +day, 12, 0, 0)),
      productWeight: row['Product Weight'],
      shippingMethod: row['Shipping Method'],
      itemCount: row['Item Count'],
      productValue: row['Value Of Products'],
      shippingFee: row['Shipping Fee Paid'],
      trackingNumber: row['Tracking #'],
      carrier: row.Carrier
    };

    if (orders.value.some((o) => o.orderNumber === newOrder.orderNumber)) {
      continue;
    }

    setOrderFinancial(newOrder, true);

    newOrders.value.push(newOrder);
  }
};

const setOrderFinancial = (order: OrderCsvRecord, useDefaultShipping?: boolean) => {
  const totalPrice = order.productValue + order.shippingFee;
  const vendorFee = totalPrice * 0.1025;
  const processingFee = totalPrice * 0.025 + 0.3;
  const cogs = order.itemCount * TEMP_COGS;
  const shippingCost = useDefaultShipping
    ? determineDefaultShippingCost(totalPrice)
    : (order.shippingCost ?? determineDefaultShippingCost(totalPrice));
  const profit = totalPrice - vendorFee - processingFee - cogs - shippingCost;
  const feePercentage = ((vendorFee + processingFee) / totalPrice) * 100;

  order.totalPrice = totalPrice;
  order.vendorFee = vendorFee;
  order.processingFee = processingFee;
  order.cogs = cogs;
  order.shippingCost = shippingCost;
  order.profit = profit;
  order.feePercentage = feePercentage;
};

const determineDefaultShippingCost = (totalPrice: number) => {
  return totalPrice >= TRACKING_THRESHOLD ? TRACKING.cost : ENVELOPE.cost;
};

const handleCsvClick = async (event: FileUploadSelectEvent) => {
  parseShippingCsv(event.files[0]);

  await parseOrderCsv(event.files[0]);

  if (shippingFlaggedOrders.value.length > 0) {
    shippingModal.value.open();
    return;
  }

  createOrders().then(() => {
    toast.add({
      severity: 'success',
      summary: 'Orders Added',
      detail: `${newOrders.value.length} new orders were added.`,
      life: 3000
    });
  });
};

const handleSubmitClick = () => {
  shippingModal.value.toggleSubmitLoading();

  shippingFlaggedOrders.value.forEach((o) => setOrderFinancial(o));

  createOrders()
    .then(() => {
      shippingModal.value.close();
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

const createOrders = async () => {
  if (!newOrders.value.length) {
    toast.add({
      severity: 'error',
      summary: 'No Orders Found',
      detail: `No new orders were found in the CSV.`,
      life: 5000
    });
  }

  const batch = pb.createBatch();

  newOrders.value.forEach((order) => {
    batch.collection(Collections.Orders).create(order);
  });

  await batch.send();
  await refreshOrders();
};

const refreshOrders = async () => {
  orders.value = await pb.collection(Collections.Orders).getFullList();
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
onMounted(() => {
  refreshOrders();
});
</script>
