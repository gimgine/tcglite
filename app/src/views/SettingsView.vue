<template>
  <div class="flex flex-wrap gap-4">
    <Panel class="basis-full" header="Settings">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <Avatar icon="pi pi-user" class="mr-2" shape="circle" size="large" />
          <span>{{ pb.authStore.record?.name }}</span>
        </div>
        <Button icon="pi pi-sign-out" variant="text" rounded @click="handleSignout" />
      </div>
    </Panel>
    <Panel :header="'Store Shipping Options'" class="flex-1">
      <Form ref="shippingForm" v-slot="$form" :initial-values :resolver="shippingResolver" class="flex flex-col gap-2" @submit="handleShippingSubmit">
        <InputText name="id" class="hidden" />

        <div class="grid grid-cols-1 gap-1 text-sm">
          <div class="grid grid-cols-11 gap-2 [&>*]:col-span-3">
            <div class="!col-span-2 font-semibold">Envelope</div>
            <div v-tooltip.top="'Packed envelopes weighing less than or equal to 1 ounce.'">1 Ounce</div>
            <div v-tooltip.top="'Packed envelopes weighing less than or equal to 2 ounces.'">2 Ounce</div>
            <div v-tooltip.top="'Packed envelopes weighing less than or equal to 3 ounces.'">3 Ounce</div>
          </div>

          <div class="grid grid-cols-11 gap-2 [&>*]:col-span-3">
            <div
              v-tooltip="'The maximum amount of cards that can fit in an order at this weight including all shipping materials.'"
              class="!col-span-2 flex items-center justify-end"
            >
              Max Cards
            </div>
            <div><InputNumber name="oneOunceCards" fluid /></div>
            <div><InputNumber name="twoOunceCards" fluid /></div>
            <div><InputNumber name="threeOunceCards" fluid /></div>
          </div>

          <div class="grid grid-cols-11 gap-2 [&>*]:col-span-3">
            <div
              v-tooltip="'Total cost to ship a package at this weight, including both postage and shipping materials.'"
              class="!col-span-2 flex items-center justify-end"
            >
              Shipping Cost
            </div>
            <div>
              <InputGroup>
                <InputGroupAddon class="pi pi-dollar" />
                <InputNumber name="oneOunceCost" currency="USD" mode="currency" />
              </InputGroup>
            </div>

            <div>
              <InputGroup>
                <InputGroupAddon class="pi pi-dollar" />
                <InputNumber name="twoOunceCost" currency="USD" mode="currency" />
              </InputGroup>
            </div>

            <div>
              <InputGroup>
                <InputGroupAddon class="pi pi-dollar" />
                <InputNumber name="threeOunceCost" currency="USD" mode="currency" />
              </InputGroup>
            </div>
          </div>
        </div>

        <div class="flex w-full flex-col gap-1">
          <label
            v-tooltip.top="'Total cost to ship a package that is more than 3 ounces, including both postage and shipping materials.'"
            for="moreOunceCost"
            class="ml-3 text-sm"
            >More Ounces Cost</label
          >
          <InputGroup>
            <InputGroupAddon class="pi pi-dollar" />
            <InputNumber name="moreOunceCost" currency="USD" mode="currency" />
          </InputGroup>
          <Message v-if="$form.moreOunceCost?.invalid" severity="error" size="small" variant="simple">
            {{ $form.moreOunceCost.error?.message }}
          </Message>
        </div>

        <div class="flex gap-2">
          <div class="flex w-full flex-col gap-1">
            <label v-tooltip.top="'Minimum order price for which tracking is required.'" for="trackingThreshold" class="ml-3 text-sm"
              >Tracking Threshold</label
            >
            <InputGroup>
              <InputGroupAddon class="pi pi-dollar" />
              <InputNumber name="trackingThreshold" currency="USD" mode="currency" />
            </InputGroup>
            <Message v-if="$form.trackingThreshold?.invalid" severity="error" size="small" variant="simple">
              {{ $form.trackingThreshold.error?.message }}
            </Message>
          </div>

          <div class="flex w-full flex-col gap-1">
            <label
              v-tooltip.top="'Total cost to ship a package with tracking, including both postage and shipping materials.'"
              for="trackingCost"
              class="ml-3 text-sm"
              >Tracking Cost</label
            >
            <InputGroup>
              <InputGroupAddon class="pi pi-dollar" />
              <InputNumber name="trackingCost" currency="USD" mode="currency" />
            </InputGroup>
            <Message v-if="$form.trackingCost?.invalid" severity="error" size="small" variant="simple">
              {{ $form.trackingCost.error?.message }}
            </Message>
          </div>
        </div>

        <div class="mt-2 flex justify-end">
          <Button type="submit" label="Save" :loading="storePreferenceSubmitLoading" />
        </div>
      </Form>
    </Panel>

    <Panel header="Additional Options" class="w-1/2">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2 text-sm">
          <FileUpload mode="basic" choose-label="Refresh Products" choose-icon="pi pi-upload" accept=".csv" auto @select="handleProductsRefresh" />
          <p class="text-xs italic">Upload your latest Pricing CSV to update your product list.</p>
        </div>

        <div class="flex flex-col gap-2 text-sm">
          <Button label="Update Order Costs" class="w-fit" :loading="isUpdateShippingLoading" @click="updateShippingInformation" />
          <p class="text-xs italic">Recalculate costs on all orders using current shipping options.</p>
        </div>
      </div>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { OrderService } from '@/service/order-service';
import { ProductService } from '@/service/product-service';
import { StorePreferencesService } from '@/service/store-preferences-service';
import { useOrderStore } from '@/store/order-store';
import { usePreferencesStore } from '@/store/preferences-store';
import { Collections, type StorePreferencesRecord } from '@/types/pocketbase-types';
import { parsePricingCsv } from '@/util/csv-parse';
import pb from '@/util/pocketbase';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import {
  Avatar,
  Button,
  FileUpload,
  InputGroup,
  InputGroupAddon,
  InputNumber,
  InputText,
  Message,
  Panel,
  useToast,
  type FileUploadSelectEvent
} from 'primevue';
import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue';
import z from 'zod';

// Types ------------------------------------------------------------------------------
interface FormValues {
  id?: string;
  oneOunceCards?: number;
  oneOunceCost?: number;
  twoOunceCards?: number;
  twoOunceCost?: number;
  threeOunceCards?: number;
  threeOunceCost?: number;
  moreOunceCost?: number;
  trackingThreshold?: number;
  trackingCost?: number;
}

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const shippingForm = useTemplateRef<FormInstance>('shippingForm');

// Variables --------------------------------------------------------------------------
const storePreferencesService = new StorePreferencesService();

const preferencesStore = usePreferencesStore();

const shippingResolver = computed(() =>
  zodResolver(
    z.object({
      id: z.string(),
      oneOunceCards: z.number().min(0, { message: 'Max number for 1 oz cards is required.' }),
      twoOunceCards: z.number().min(0, { message: 'Max number for 2 oz cards is required.' }),
      threeOunceCards: z.number().min(0, { message: 'Max number for 3 oz cards is required.' }),
      oneOunceCost: z.number().min(0, { message: 'Shipping cost of 1 oz cards is required.' }),
      twoOunceCost: z.number().min(0, { message: 'Shipping cost of 2 oz cards is required.' }),
      threeOunceCost: z.number().min(0, { message: 'Shipping cost of 3 oz cards is required.' }),
      moreOunceCost: z.number().min(0, { message: 'Shipping cost of excess cards is required.' }),
      trackingCost: z.number().min(0, { message: 'Tracking cost is required.' }),
      trackingThreshold: z.number()
    })
  )
);

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const storePreferenceSubmitLoading = ref(false);
const isUpdateShippingLoading = ref(false);

const initialValues = reactive<FormValues>({
  id: '',
  oneOunceCards: undefined,
  oneOunceCost: undefined,
  twoOunceCards: undefined,
  twoOunceCost: undefined,
  threeOunceCards: undefined,
  threeOunceCost: undefined,
  moreOunceCost: undefined,
  trackingThreshold: undefined,
  trackingCost: undefined
});

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handleShippingSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) return;
  storePreferenceSubmitLoading.value = true;
  await storePreferencesService.update(values as StorePreferencesRecord);
  toast.add({ severity: 'success', summary: 'Preferences Updated', detail: 'Store preferences successfully updated.', life: 3000 });
  await preferencesStore.refresh();
  storePreferenceSubmitLoading.value = false;
  preferencesStore.refresh();
};

const handleSignout = () => {
  pb.authStore.clear();
  router.push({ name: 'login' });
};

const handleProductsRefresh = async (event: FileUploadSelectEvent) => {
  const service = new ProductService();
  const pricingCsv = await parsePricingCsv(event.files[0]);
  const result = await service.syncProducts(pricingCsv);
  toast.add({
    severity: result.success ? 'success' : 'error',
    summary: result.success ? 'Products Synced' : 'Sync Failed',
    detail: result.message,
    life: 3000
  });
};

const updateShippingInformation = async () => {
  isUpdateShippingLoading.value = true;

  const orderService = new OrderService();
  const orders = await pb.collection(Collections.Orders).getFullList();
  const preferences = preferencesStore.preferences;

  const batch = pb.createBatch();

  orders.forEach((order) => {
    if (preferences) {
      order.shippingCost = orderService.determineShippingCost(order.totalPrice, order.itemCount, preferences);
      order.packageOunces = orderService.determineWeight(order.itemCount, preferences);
      order.isTracking = orderService.determineTracking(order.totalPrice, preferences);
      order.profit = orderService.determineProfit(order.totalPrice, order.vendorFee, order.processingFee, order.cogs, order.shippingCost);

      batch.collection(Collections.Orders).update(order.id, order);
    }
  });

  try {
    await batch.send();
    toast.add({
      summary: 'Shipping Information Updated',
      detail: 'Shipping and profit data was updated using current store preferences.',
      life: 3000,
      severity: 'success'
    });
    await useOrderStore().refresh();
  } catch {
    toast.add({ summary: 'Error', detail: 'Something went wrong updating records.', life: 3000, severity: 'error' });
  } finally {
    isUpdateShippingLoading.value = false;
  }
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  await preferencesStore.refresh();
  if (!preferencesStore.preferences) return;

  shippingForm.value?.setValues(preferencesStore.preferences);
});
</script>
