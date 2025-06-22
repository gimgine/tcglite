<template>
  <div class="grid grid-cols-12">
    <div class="col-span-12">
      <div class="bg-white p-4">
        <DataTable :value="orders" removable-sort filter-display="menu" striped-rows>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg">Order History</span>
              <FileUpload mode="basic" choose-label="CSV" choose-icon="pi pi-file-arrow-up" accept=".csv" @select="handleUpload" auto />
            </div>
          </template>
          <Column field="orderNumber" header="Order Number" sortable />
          <Column field="firstName" header="First Name" sortable />
          <Column field="lastName" header="Last Name" sortable />
          <Column field="address" header="Address" sortable />
          <Column field="city" header="City" sortable />
          <Column field="state" header="State" sortable />
          <Column field="postalCode" header="Postal Code" sortable />
          <Column field="orderDate" header="Order Date" sortable />
          <Column field="count" header="Item Count" sortable />
          <Column field="value" header="Value" sortable />
          <Column field="shippingFee" header="Shipping Fee" sortable />
          <Column field="trackingNumber" header="Tracking Number" sortable />
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileUpload, DataTable, Column, type FileUploadSelectEvent } from 'primevue';
import pb from '@/util/pocketbase';
import { Collections, type OrdersRecord } from '@/types/pocketbase-types';
import { onMounted, ref } from 'vue';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------
const orders = ref<OrdersRecord[]>([]);
// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const parseOrderCsv = async (file: Blob): Promise<any[]> => {
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

        orders.push({
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
          weight: +splitLine[10],
          shippingMethod: splitLine[11],
          count: +splitLine[12],
          value: +splitLine[13],
          shippingFee: +splitLine[14],
          trackingNumber: splitLine[15],
          carrier: splitLine[16]
        });
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

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  refreshOrders();
});
</script>
