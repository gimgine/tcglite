<template>
  <div class="flex flex-wrap gap-4">
    <Panel v-if="store" class="basis-full pt-4 text-lg font-bold [&_.p-panel-header]:hidden!">{{ store.name }}</Panel>
    <Panel :header="store ? 'Shipping Options' : 'Create Store'" class="flex-1">
      <Form ref="form" v-slot="$form" :resolver class="flex flex-col gap-2" @submit="handleSubmit">
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
            <Message
              v-for="item in slotProps.items"
              :key="item.name"
              :closable="item.id !== pb.authStore.record?.id"
              size="small"
              severity="secondary"
              @close="removeMember(item.id)"
            >
              {{ item.name }}
            </Message>
          </div>
        </template>
      </DataView>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { StorePreferencesService } from '@/service/store-preferences-service';
import { StoreService } from '@/service/store-service';
import { UserService } from '@/service/user service';
import { useStorePreferencesStore } from '@/store/store-preferences-store';
import { Collections, StorePreferencesFieldOptions, type StoresRecord, type UsersRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { Button, DataView, InputGroup, InputGroupAddon, InputNumber, InputText, Message, Panel, useToast } from 'primevue';
import { onMounted, ref, useTemplateRef } from 'vue';
import z from 'zod';
// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const form = useTemplateRef<FormInstance>('form');

// Variables --------------------------------------------------------------------------
const storeService = new StoreService();
const userService = new UserService();
const storePreferencesService = new StorePreferencesService();

const storePreferencesStore = useStorePreferencesStore();

const resolver = zodResolver(
  z.object({
    name: z.string().min(0, { message: 'Name is required.' }),
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
);

// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const store = ref<StoresRecord>();
const storeMembers = ref<UsersRecord[]>();

const storeMembersFilter = ref<string>('');

const storePreferenceSubmitLoading = ref(false);

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

const handleSubmit = async ({ valid, values }: FormSubmitEvent) => {
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

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  if (pb.authStore.record?.store) store.value = await storeService.getOne(pb.authStore.record?.store);
  await storePreferencesStore.refresh();
  if (!storePreferencesStore.preferences) return;
  form.value?.setValues(
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
