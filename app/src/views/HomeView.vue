<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-3">
      <div class="flex flex-col gap-2 rounded-md bg-white p-6">
        <div class="text-sm text-gray-600">Profit</div>
        <div>{{ formatCurrency(totalProfit(orders)) }}</div>
      </div>
    </div>

    <div class="col-span-12 md:col-span-3">
      <div class="flex flex-col gap-2 rounded-md bg-white p-6">
        <div class="text-sm text-gray-600">Orders</div>
        <div>{{ orders.length }}</div>
      </div>
    </div>

    <div class="col-span-12 md:col-span-3">
      <div class="flex flex-col gap-2 rounded-md bg-white p-6">
        <div class="text-sm text-gray-600">Last Updated</div>
        <div>{{ new Date(Math.max(...orders.map((order) => new Date(order.created!).getTime()))).toLocaleString() }}</div>
      </div>
    </div>

    <div class="col-span-12">
      <div class="rounded-md bg-white p-4 pt-0">
        <DataTable v-model:expanded-rows="expandedRows" :value="orders" removable-sort filter-display="menu" data-key="orderNumber" striped-rows>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-4 md:flex-row md:items-center">
                <span class="text-lg">Order Profits</span>
              </div>
              <div>
                <FileUpload mode="basic" choose-label="CSV" choose-icon="pi pi-file-arrow-up" accept=".csv" auto @select="handleCsvClick" />
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

  <Dialog v-model:visible="shippingDialogVisible" modal>
    <DataTable :value="shippingFlaggedOrders">
      <template #header>
        <span>Confirm Shipping Method</span>
      </template>
      <Column header="Name">
        <template #body="slotProps">
          {{ `${slotProps.data.firstName} ${slotProps.data.lastName}` }}
        </template>
      </Column>
      <Column field="orderDate" header="Order Date">
        <template #body="slotProps">
          {{ slotProps.data.orderDate.toLocaleDateString() }}
        </template>
      </Column>
      <Column header="Total Price">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.productValue + slotProps.data.shippingFee) }}
        </template>
      </Column>
      <Column header="Shipping">
        <template #body="slotProps">
          <Select v-model="slotProps.data.shippingCost" :options="shippingMethods" option-label="name" option-value="cost">
            <template #value="selectSlotProps">
              <span
                :class="`rounded-sm px-2 py-0.5 text-xs font-bold ${selectSlotProps.value === TRACKING.cost ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600'}`"
              >
                {{ getShippingMethod(selectSlotProps.value)?.name }}
              </span>
            </template>
            <template #option="selectSlotProps">
              <span
                :class="`rounded-sm px-2 py-0.5 text-xs font-bold ${selectSlotProps.option.cost === TRACKING.cost ? 'bg-blue-200 text-blue-600' : 'bg-pink-200 text-pink-600'}`"
              >
                {{ selectSlotProps.option.name }}
              </span>
            </template>
          </Select>
        </template>
      </Column>
    </DataTable>
    <template #footer>
      <Button label="Submit" :loading="isSubmitLoading" @click="handleSubmitClick" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { OrderCsvRecord } from '@/types';
import { Collections, type OrdersRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { Button, Column, DataTable, Dialog, FileUpload, type FileUploadSelectEvent, Select } from 'primevue';
import { computed, onMounted, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------
const ENVELOPE = { cost: 1, name: 'Envelope' };
const TRACKING = { cost: 5, name: 'Tracking' };

const QUESTIONABLE_TRACKING_THRESHOLD = 20;
const TRACKING_THRESHOLD = 30;

const TEMP_COGS = 0.26;

// Reactive Variables -----------------------------------------------------------------
const orders = ref<OrdersRecord[]>([]);
const shippingMethods = ref<{ cost: number; name: string }[]>([ENVELOPE, TRACKING]);

const expandedRows = ref({});

const shippingDialogVisible = ref(false);
const newOrders = ref<OrderCsvRecord[]>([]);
const shippingFlaggedOrders = computed(() => newOrders.value.filter((o) => o.productValue + o.shippingFee > QUESTIONABLE_TRACKING_THRESHOLD));
const isSubmitLoading = ref(false);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const parseOrderCsv = async (file: Blob): Promise<OrderCsvRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const lines = result.split(/\r?\n/);

      if (
        lines[0] !==
        'Order #,FirstName,LastName,Address1,Address2,City,State,PostalCode,Country,Order Date,Product Weight,Shipping Method,Item Count,Value Of Products,Shipping Fee Paid,Tracking #,Carrier'
      ) {
        console.warn('File not of correct type.');
        return;
      }

      const newOrders = [];

      for (const line of lines) {
        if (line.split(',')[0] === 'Order #') continue;

        const splitLine = line.split(',').map((v) => v.replace(/^"|"$/g, ''));
        if (splitLine.length < 17) continue;

        const [year, month, day] = splitLine[9].split('-');
        const newOrder: OrderCsvRecord = {
          orderNumber: splitLine[0],
          firstName: splitLine[1],
          lastName: splitLine[2],
          address: splitLine[3],
          addressTwo: splitLine[4],
          city: splitLine[5],
          state: splitLine[6],
          postalCode: splitLine[7],
          country: splitLine[8],
          orderDate: new Date(Date.UTC(+year, +month - 1, +day, 12, 0, 0)),
          productWeight: +splitLine[10],
          shippingMethod: splitLine[11],
          itemCount: +splitLine[12],
          productValue: +splitLine[13],
          shippingFee: +splitLine[14],
          trackingNumber: splitLine[15],
          carrier: splitLine[16]
        };

        if (orders.value.some((o) => o.orderNumber === newOrder.orderNumber)) {
          continue;
        }

        setOrderFinancial(newOrder, true);

        newOrders.push(newOrder);
      }

      resolve(newOrders);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
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
  const parsedOrders = await parseOrderCsv(event.files[0]);

  newOrders.value = parsedOrders;

  if (shippingFlaggedOrders.value.length > 0) {
    shippingDialogVisible.value = true;
    return;
  }

  await createOrders();
};

const handleSubmitClick = () => {
  isSubmitLoading.value = true;

  shippingFlaggedOrders.value.forEach((o) => setOrderFinancial(o));

  createOrders()
    .then(() => {
      shippingDialogVisible.value = false;
    })
    .finally(() => {
      isSubmitLoading.value = false;
    });
};

const createOrders = async () => {
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

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const totalProfit = (orders: OrdersRecord[]) => {
  let profit = 0;
  orders.forEach((order) => {
    profit += order.profit ?? 0;
  });
  return profit;
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(() => {
  refreshOrders();
});
</script>
