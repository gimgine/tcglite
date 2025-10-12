<template>
  <div class="flex flex-wrap gap-4">
    <Panel v-model:collapsed="topPanelCollapsed" class="basis-full [&_.p-panel-header]:my-2 [&_.p-panel-header]:items-start!" toggleable>
      <template #header>
        <Form ref="namesForm" class="flex flex-col gap-4" :resolver="namesResolver" @submit="handleNamesSubmit">
          <div class="flex items-center">
            <Avatar icon="pi pi-user" class="mr-2" shape="circle" size="large" />
            <span v-show="topPanelCollapsed">{{ pb.authStore.record?.name }}</span>
            <InputText v-show="!topPanelCollapsed" name="userName" />
          </div>
          <div v-if="store" class="flex items-center">
            <Avatar icon="pi pi-shop" class="mr-2" size="large" />
            <span v-show="topPanelCollapsed">{{ store?.name }}</span>
            <InputText v-show="!topPanelCollapsed" name="storeName" />
          </div>
        </Form>
      </template>
      <template #icons><Button icon="pi pi-sign-out" variant="text" rounded @click="handleSignout" /></template>
      <template #toggleicon><i class="pi pi-pencil" /></template>
      <div class="flex justify-end gap-2">
        <Button severity="secondary" label="Cancel" @click="topPanelCollapsed = true" />
        <Button label="Submit" @click="namesForm?.submit()" />
      </div>
    </Panel>
    <Panel :header="store ? 'Store Shipping Options' : 'Create Store'" class="flex-1">
      <Form ref="shippingForm" v-slot="$form" :initial-values :resolver="shippingResolver" class="flex flex-col gap-2" @submit="handleShippingSubmit">
        <InputText name="id" class="hidden" />

        <div v-if="!store" class="flex w-full flex-col gap-1">
          <label for="name" class="ml-3 text-sm">Name</label>
          <InputText name="name" />
          <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
            {{ $form.name.error?.message }}
          </Message>
        </div>

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

    <Panel v-if="store" class="flex-1">
      <template #header>
        <div class="flex w-full justify-between">
          <span class="font-semibold">Store Members</span>
          <InputGroup class="!w-54">
            <InputText v-model="storeMembersFilter" size="small" placeholder="Search/Add members" />
            <InputGroupAddon>
              <i class="pi pi-search" />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </template>
      <DataView :value="storeMembers?.filter((m) => m.name?.match(new RegExp(storeMembersFilter, 'i')))">
        <template #empty>
          <div class="flex w-full items-center justify-center gap-4 p-2">
            No members found. <Button icon="pi pi-plus" variant="outlined" size="small" @click="addMember" />
          </div>
        </template>
        <template #list="slotProps">
          <div class="flex flex-col gap-2">
            <Message v-for="item in slotProps.items" :key="item.name" closable size="small" severity="secondary" @close="removeMember(item.id)">
              {{ item.name }}
            </Message>
          </div>
        </template>
      </DataView>
    </Panel>

    <Panel v-if="store" header="Additional Options" class="basis-full">
      <div class="flex flex-col gap-2 text-sm">
        <FileUpload mode="basic" choose-label="Update Products" choose-icon="pi pi-upload" accept=".csv" auto @select="syncProducts" />
        <p class="text-xs italic">Upload your latest Pricing CSV to update your product list.</p>
      </div>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { StorePreferencesService } from '@/service/store-preferences-service';
import { StoreService } from '@/service/store-service';
import { UserService } from '@/service/user-service';
import { usePreferencesStore } from '@/store/preferences-store';
import { Collections, type ProductsRecord, type StorePreferencesRecord, type StoresRecord, type UsersRecord } from '@/types/pocketbase-types';
import { parsePricingCsv, type PricingCsv } from '@/util/csv-parse';
import pb from '@/util/pocketbase';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import {
  Avatar,
  Button,
  DataView,
  InputGroup,
  InputGroupAddon,
  InputNumber,
  InputText,
  Message,
  Panel,
  useToast,
  FileUpload,
  type FileUploadSelectEvent
} from 'primevue';
import { computed, nextTick, onMounted, reactive, ref, useTemplateRef } from 'vue';
import z from 'zod';

// Types ------------------------------------------------------------------------------
interface FormValues {
  id?: string;
  name: string;
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
const namesForm = useTemplateRef<FormInstance>('namesForm');

// Variables --------------------------------------------------------------------------
const storeService = new StoreService();
const userService = new UserService();
const storePreferencesService = new StorePreferencesService();

const preferencesStore = usePreferencesStore();

const namesResolver = computed(() => zodResolver(z.object({ userName: z.string().min(1), storeName: !store.value ? z.string().min(1) : z.any() })));
const shippingResolver = computed(() =>
  zodResolver(
    z.object({
      id: z.string(),
      name: !store.value ? z.string().min(1, { message: 'Name is required.' }) : z.any(),
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

const store = ref<StoresRecord>();
const storeMembers = ref<UsersRecord[]>();

const storeMembersFilter = ref<string>('');

const storePreferenceSubmitLoading = ref(false);

const topPanelCollapsed = ref(true);

const initialValues = reactive<FormValues>({
  id: '',
  name: '',
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
const fetchMembers = async () => {
  if (!store.value) return;
  storeMembers.value = await userService.getForStore(store.value.id);
};

const addMember = async () => {
  try {
    const user = await userService.getByName(storeMembersFilter.value);
    if (user.store) {
      toast.add({ severity: 'error', summary: 'User Has Store', detail: 'That user is already assigned to a store.', life: 3000 });
      return;
    }
    try {
      await userService.update(user.id, { store: store.value?.id });
      toast.add({ severity: 'success', summary: 'User Added', detail: 'The user has successfully been added to the store.', life: 3000 });
      fetchMembers();
      storeMembersFilter.value = '';
    } catch {
      toast.add({ severity: 'error', summary: 'User Not Added', detail: 'There was a problem adding the user to the store.', life: 3000 });
    }
  } catch {
    toast.add({ severity: 'error', summary: 'User Not Found', detail: 'No user found with the given name.', life: 3000 });
  }
};

const removeMember = async (id: string) => {
  try {
    await pb.collection(Collections.Users).update(id, { store: null });
    toast.add({ severity: 'success', summary: 'User Removed', detail: 'The user has successfully been removed from the store.', life: 3000 });
    fetchMembers();
  } catch {
    toast.add({ severity: 'error', summary: 'User Not Removed', detail: 'There was a problem removing the user from the store.', life: 3000 });
  }
};

const handleNamesSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) return;
  await userService.update(pb.authStore.record!.id, { name: values.userName });
  if (store.value) {
    await storeService.update(store.value.id, { name: values.storeName });
    store.value = await storeService.getOne(store.value.id);
  }
  await userService.authRefresh();
  topPanelCollapsed.value = true;
};

const handleShippingSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) return;
  storePreferenceSubmitLoading.value = true;

  if (!store.value) {
    store.value = await storeService.create(values.name);

    await userService.update(pb.authStore.record!.id, { store: store.value.id });
    await storePreferencesService.create({ store: store.value.id, ...values });

    await preferencesStore.refresh();
  } else {
    await storePreferencesService.update(values as StorePreferencesRecord);
    toast.add({ severity: 'success', summary: 'Preferences Updated', detail: 'Store preferences successfully updated.', life: 3000 });
  }

  await preferencesStore.refresh();
  storePreferenceSubmitLoading.value = false;
  preferencesStore.refresh();
};

const handleSignout = () => {
  pb.authStore.clear();
  router.push({ name: 'login' });
};

const syncProducts = async (event: FileUploadSelectEvent) => {
  const pricingCsv = await parsePricingCsv(event.files[0]);
  const products = await pb.collection(Collections.Products).getFullList();

  const productsToCreate: PricingCsv[] = [];
  const productsToUpdate: ProductsRecord[] = [];

  // update market price for exising products and identify which pricing records are new
  for (const pricing of pricingCsv) {
    const possibleProductForPricing = products.find((p) => pricing['TCGplayer Id'] === p.tcgPlayerId);
    if (possibleProductForPricing) {
      if (possibleProductForPricing.marketPrice !== (pricing['TCG Market Price'] ?? 0)) {
        possibleProductForPricing.marketPrice = pricing['TCG Market Price'];
        possibleProductForPricing.marketPriceUpdated = new Date().toUTCString();
        productsToUpdate.push(possibleProductForPricing);
      }
    } else {
      productsToCreate.push(pricing);
    }
  }

  if (!productsToCreate.length && !productsToUpdate.length) {
    toast.add({ severity: 'success', summary: 'Products Synced', detail: 'No updates were needed.', life: 3000 });
    return;
  }

  // create new products
  const batch = pb.createBatch();

  productsToCreate.forEach((product) => {
    batch.collection(Collections.Products).create({
      store: pb.authStore.record?.store,
      productLine: product['Product Line'],
      name: product['Product Name'],
      condition: product['Condition'],
      set: product['Set Name'],
      number: product['Number'],
      rarity: product.Rarity,
      language: product.Condition.split(' - ')[1] ?? 'English', // ex. 'Near Mint - Japanese'
      tcgPlayerId: product['TCGplayer Id'],
      marketPrice: product['TCG Market Price'],
      marketPriceUpdated: new Date().toUTCString()
    });
  });

  productsToUpdate.forEach((product) => {
    batch.collection(Collections.Products).update(product.id, product);
  });

  await batch.send();
  toast.add({ severity: 'success', summary: 'Products Synced', detail: 'Store product list successfully synchronized.', life: 3000 });
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  if (pb.authStore.record?.store) store.value = await storeService.getOne(pb.authStore.record?.store);
  await nextTick();

  namesForm.value?.setValues({ userName: pb.authStore.record?.name, storeName: store.value?.name });

  await preferencesStore.refresh();
  if (!preferencesStore.preferences) return;

  shippingForm.value?.setValues(preferencesStore.preferences);

  fetchMembers();
});
</script>
