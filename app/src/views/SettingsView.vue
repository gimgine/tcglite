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
      <Form ref="shippingForm" v-slot="$form" :resolver="shipppingResolver" class="flex flex-col gap-2" @submit="handleShippingSubmit">
        <div v-if="!store" class="flex w-full flex-col gap-1">
          <label for="name" class="ml-3 text-sm">Name</label>
          <InputText name="name" />
          <Message v-if="$form.more_oz_cost?.invalid" severity="error" size="small" variant="simple">{{ $form.more_oz_cost.error?.message }}</Message>
        </div>
        <div class="grid grid-cols-1 gap-1 text-sm">
          <div class="grid grid-cols-11 gap-2 [&>*]:col-span-3">
            <div class="!col-span-2 font-semibold">Envelope</div>
            <div>1 Ounce</div>
            <div>2 Ounce</div>
            <div>3 Ounce</div>
          </div>
          <div class="grid grid-cols-11 gap-2 [&>*]:col-span-3">
            <div class="!col-span-2 flex items-center justify-end">Max Cards</div>
            <div><InputNumber name="1_oz_cards" fluid /></div>
            <div><InputNumber name="2_oz_cards" fluid /></div>
            <div><InputNumber name="3_oz_cards" fluid /></div>
          </div>
          <div class="grid grid-cols-11 gap-2 [&>*]:col-span-3">
            <div class="!col-span-2 flex items-center justify-end">Shipping Cost</div>
            <div>
              <InputGroup>
                <InputGroupAddon class="pi pi-dollar" />
                <InputNumber name="1_oz_cost" currency="USD" mode="currency" />
              </InputGroup>
            </div>
            <div>
              <InputGroup>
                <InputGroupAddon class="pi pi-dollar" />
                <InputNumber name="2_oz_cost" currency="USD" mode="currency" />
              </InputGroup>
            </div>
            <div>
              <InputGroup>
                <InputGroupAddon class="pi pi-dollar" />
                <InputNumber name="3_oz_cost" currency="USD" mode="currency" />
              </InputGroup>
            </div>
          </div>
        </div>
        <div class="flex w-full flex-col gap-1">
          <label for="more_oz_cost" class="ml-3 text-sm">More Ounces Cost</label>
          <InputGroup>
            <InputGroupAddon class="pi pi-dollar" />
            <InputNumber name="more_oz_cost" currency="USD" mode="currency" />
          </InputGroup>
          <Message v-if="$form.more_oz_cost?.invalid" severity="error" size="small" variant="simple">{{ $form.more_oz_cost.error?.message }}</Message>
        </div>
        <div class="flex gap-2">
          <div class="flex w-full flex-col gap-1">
            <label for="tracking_threshold" class="ml-3 text-sm">Tracking Threshold</label>
            <InputGroup>
              <InputGroupAddon class="pi pi-dollar" />
              <InputNumber name="tracking_threshold" currency="USD" mode="currency" />
            </InputGroup>
            <Message v-if="$form.tracking_threshold?.invalid" severity="error" size="small" variant="simple">{{
              $form.tracking_threshold.error?.message
            }}</Message>
          </div>
          <div class="flex w-full flex-col gap-1">
            <label for="tracking_cost" class="ml-3 text-sm">Tracking Cost</label>
            <InputGroup>
              <InputGroupAddon class="pi pi-dollar" />
              <InputNumber name="tracking_cost" currency="USD" mode="currency" />
            </InputGroup>
            <Message v-if="$form.tracking_cost?.invalid" severity="error" size="small" variant="simple">{{
              $form.tracking_cost.error?.message
            }}</Message>
          </div>
        </div>
        <div class="mt-2 flex justify-end">
          <Button type="submit" label="Submit" :loading="storePreferenceSubmitLoading" />
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
        <template #empty
          ><div class="flex w-full items-center justify-center gap-4 p-2">
            No members found. <Button icon="pi pi-plus" variant="outlined" size="small" @click="addMember" /></div
        ></template>
        <template #list="slotProps">
          <div class="flex flex-col gap-2">
            <Message v-for="item in slotProps.items" :key="item.name" closable size="small" severity="secondary" @close="removeMember(item.id)">
              {{ item.name }}
            </Message>
          </div>
        </template>
      </DataView>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { StorePreferencesService } from '@/service/store-preferences-service';
import { StoreService } from '@/service/store-service';
import { UserService } from '@/service/user service';
import { useStorePreferencesStore } from '@/store/store-preferences-store';
import { Collections, StorePreferencesFieldOptions, type StoresRecord, type UsersRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { Avatar, Button, DataView, InputGroup, InputGroupAddon, InputNumber, InputText, Message, Panel, useToast } from 'primevue';
import { computed, onMounted, ref, useTemplateRef, nextTick } from 'vue';
import z from 'zod';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const shippingForm = useTemplateRef<FormInstance>('shippingForm');
const namesForm = useTemplateRef<FormInstance>('namesForm');

// Variables --------------------------------------------------------------------------
const storeService = new StoreService();
const userService = new UserService();
const storePreferencesService = new StorePreferencesService();

const storePreferencesStore = useStorePreferencesStore();

const namesResolver = computed(() => zodResolver(z.object({ userName: z.string().min(1), storeName: !store.value ? z.string().min(1) : z.any() })));
const shipppingResolver = computed(() =>
  zodResolver(
    z.object({
      name: !store.value ? z.string().min(1, { message: 'Name is required.' }) : z.any(),
      '1_oz_cards': z.number().min(0, { message: 'Max number for 1 oz cards is required.' }),
      '2_oz_cards': z.number().min(0, { message: 'Max number for 2 oz cards is required.' }),
      '3_oz_cards': z.number().min(0, { message: 'Max number for 3 oz cards is required.' }),
      '1_oz_cost': z.number().min(0, { message: 'Shipping cost of 1 oz cards is required.' }),
      '2_oz_cost': z.number().min(0, { message: 'Shipping cost of 2 oz cards is required.' }),
      '3_oz_cost': z.number().min(0, { message: 'Shipping cost of 3 oz cards is required.' }),
      more_oz_cost: z.number().min(0, { message: 'Shipping cost of excess cards is required.' }),
      tracking_cost: z.number().min(0, { message: 'Tracking cost is required.' }),
      tracking_threshold: z.number()
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
    const preferences = Object.keys(values)
      .filter((key) => key !== 'name')
      .map((key) => ({
        store: store.value!.id,
        field: key as StorePreferencesFieldOptions,
        value: values[key]
      }));
    await storePreferencesService.batchCreate(preferences);
  } else {
    const preferences = Object.keys(values)
      .filter((key) => key !== 'name')
      .map((key) => ({
        id: storePreferencesStore.preferences![key as StorePreferencesFieldOptions].id,
        field: key as StorePreferencesFieldOptions,
        value: values[key]
      }));
    await storePreferencesService.batchUpdate(preferences);
  }
  await storePreferencesStore.refresh();
  storePreferenceSubmitLoading.value = false;
};

const handleSignout = async () => {
  await pb.authStore.clear();
  router.push({ name: 'login' });
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  if (pb.authStore.record?.store) store.value = await storeService.getOne(pb.authStore.record?.store);
  await nextTick();
  namesForm.value?.setValues({ userName: pb.authStore.record?.name, storeName: store.value?.name });
  await storePreferencesStore.refresh();
  if (!storePreferencesStore.preferences) return;
  shippingForm.value?.setValues(
    Object.keys(storePreferencesStore.preferences!).reduce(
      (acc, key) => {
        acc[key] = +storePreferencesStore.preferences![key as StorePreferencesFieldOptions].value!;
        return acc;
      },
      {} as Record<string, number | undefined>
    )
  );
  fetchMembers();
});
</script>
