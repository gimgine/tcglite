<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-3">
      <div class="flex flex-col gap-2 rounded-md bg-white p-6">
        <div class="text-sm text-gray-600">Profit</div>
        <div>{{ formatCurrency(totalProfit(orders)) }}</div>
      </div>
    </div>
    <div class="col-span-12">
      <div class="rounded-md bg-white p-4 pt-0">
        <DataTable v-model:expanded-rows="expandedRows" :value="orders" removable-sort filter-display="menu" data-key="orderNumber" striped-rows>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <span class="text-lg">Order History</span>
                <SelectButton v-model="selectedTableOption" :options="tableOptions" />
              </div>
              <div>
                <FileUpload mode="basic" choose-label="CSV" choose-icon="pi pi-file-arrow-up" accept=".csv" auto @select="handleUpload" />
              </div>
            </div>
          </template>
          <Column v-if="selectedTableOption === 'Profits'" expander />
          <Column field="orderNumber" header="Order Number" sortable />
          <Column field="firstName" header="First Name" sortable />
          <Column field="lastName" header="Last Name" sortable />
          <Column v-if="selectedTableOption === 'Orders'" field="address" header="Address" sortable />
          <Column v-if="selectedTableOption === 'Orders'" field="city" header="City" sortable />
          <Column v-if="selectedTableOption === 'Orders'" field="state" header="State" sortable />
          <Column v-if="selectedTableOption === 'Orders'" field="postalCode" header="Postal Code" sortable />
          <Column field="orderDate" header="Order Date" sortable>
            <template #body="slotProps">
              {{ new Date(slotProps.data.orderDate).toLocaleDateString() }}
            </template>
          </Column>
          <Column v-if="selectedTableOption === 'Orders'" field="itemCount" header="Item Count" sortable />
          <Column v-if="selectedTableOption === 'Orders'" field="productValue" header="Value" sortable>
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.productValue) }}
            </template>
          </Column>
          <Column v-if="selectedTableOption === 'Orders'" field="shippingFee" header="Shipping Fee" sortable>
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.shippingFee) }}
            </template>
          </Column>
          <Column v-if="selectedTableOption === 'Orders'" field="trackingNumber" header="Tracking Number" sortable />
          <Column v-if="selectedTableOption === 'Profits'" field="totalPrice" header="Total Price" sortable>
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.totalPrice) }}
            </template>
          </Column>
          <Column v-if="selectedTableOption === 'Profits'" header="Fees">
            <template #body="slotProps">
              <span class="text-orange-600">
                {{ formatCurrency(slotProps.data.processingFee + slotProps.data.vendorFee) }}
              </span>
            </template>
          </Column>
          <Column v-if="selectedTableOption === 'Profits'" field="cogs" header="COGS" sortable>
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.cogs) }}
            </template>
          </Column>
          <Column v-if="selectedTableOption === 'Profits'" field="shippingCost" header="Shipping" sortable>
            <template #body="slotProps">
              <span :class="`rounded-sm px-2 py-0.5 text-xs font-bold ${getShippingMethodColor(slotProps.data.shippingCost)}`">
                {{ getShippingMethod(slotProps.data.shippingCost)?.name }}
              </span>
            </template>
          </Column>
          <Column v-if="selectedTableOption === 'Profits'" field="profit" header="Profit/Loss" sortable>
            <template #body="slotProps">
              <span :class="slotProps.data.profit > 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(slotProps.data.profit) }}
              </span>
            </template>
          </Column>

          <template v-if="selectedTableOption === 'Profits'" #expansion="slotProps">
            <div>
              <span>{{ slotProps.data.orderNumber }}</span>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Collections, type OrdersRecord, type ShippingRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { Column, DataTable, FileUpload, type FileUploadSelectEvent, SelectButton } from 'primevue';
import { onMounted, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------
const orders = ref<OrdersRecord[]>([]);
const shippingMethods = ref<ShippingRecord[]>([]);

const selectedTableOption = ref('Profits');
const tableOptions = ref(['Orders', 'Profits']);
const expandedRows = ref({});
// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const parseOrderCsv = async (file: Blob): Promise<{ [key: string]: unknown }[]> => {
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

      const orders = [];

      for (const line of lines) {
        if (line.split(',')[0] === 'Order #') continue;

        const splitLine = line.split(',').map((v) => v.replace(/^"|"$/g, ''));
        if (splitLine.length < 17) continue;

        const newOrder = {
          orderNumber: splitLine[0],
          firstName: splitLine[1],
          lastName: splitLine[2],
          address: splitLine[3],
          addressTwo: splitLine[4],
          city: splitLine[5],
          state: splitLine[6],
          postalCode: splitLine[7],
          country: splitLine[8],
          orderDate: splitLine[9],
          productWeight: +splitLine[10],
          shippingMethod: splitLine[11],
          itemCount: +splitLine[12],
          productValue: +splitLine[13],
          shippingFee: +splitLine[14],
          trackingNumber: splitLine[15],
          carrier: splitLine[16]
        };

        const TEMP_COGS = 0.26;
        const TEMP_SHIPPING_COST = 1.0;

        const newOrderFinancial = {
          totalPrice: newOrder.productValue + newOrder.shippingFee,
          vendorFee: (newOrder.productValue + newOrder.shippingFee) * 0.1025,
          processingFee: (newOrder.productValue + newOrder.shippingFee) * 0.025 + 0.3,
          cogs: newOrder.itemCount * TEMP_COGS,
          shippingCost: TEMP_SHIPPING_COST,
          profit:
            newOrder.productValue +
            newOrder.shippingFee -
            ((newOrder.productValue + newOrder.shippingFee) * 0.1275 + 0.3) -
            newOrder.itemCount * TEMP_COGS -
            TEMP_SHIPPING_COST,
          feePercentage: (((newOrder.productValue + newOrder.shippingFee) * 0.1275 + 0.3) / (newOrder.productValue + newOrder.shippingFee)) * 100
        };

        orders.push({ ...newOrder, ...newOrderFinancial });
      }

      resolve(orders);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

const handleUpload = async (event: FileUploadSelectEvent) => {
  const newOrders = await parseOrderCsv(event.files[0]);

  const batch = pb.createBatch();

  newOrders.forEach((order) => {
    if (!orders.value.some((o) => o.orderNumber === order.orderNumber)) batch.collection(Collections.Orders).create(order);
  });

  await batch.send();
  await refreshOrders();
};

const refreshOrders = async () => {
  orders.value = await pb.collection(Collections.Orders).getFullList();
};

const refreshShippingMethods = async () => {
  shippingMethods.value = await pb.collection(Collections.Shipping).getFullList();
};

const getShippingMethod = (shippingCost: number) => {
  return shippingMethods.value.find((sm) => sm.cost === shippingCost);
};

const getShippingMethodColor = (shippingCost: number) => {
  const colors = { blue: 'text-blue-600 bg-blue-200', pink: 'text-pink-600 bg-pink-200' };
  return colors[getShippingMethod(shippingCost)?.color as 'blue' | 'pink'];
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
  refreshShippingMethods();
});
</script>
