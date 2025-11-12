<template>
  <div class="flex h-full w-full flex-col items-center justify-center">
    <Card class="w-96">
      <template #title>
        <div class="my-2">Admin Functions</div>
      </template>
      <template #content>
        <div v-show="pb.authStore.isSuperuser">
          <Panel header="Store Actions">
            <div class="flex flex-col gap-2">
              <Select v-model="selectedStore" :options="stores" option-label="name" placeholder="Store" />
            </div>
          </Panel>
          <Button label="Split up Order Items" class="mt-2" @click="splitOrderItems" />
        </div>
        <div v-show="!pb.authStore.isSuperuser">
          <Form ref="loginForm" class="flex flex-col gap-2" @submit="login">
            <InputText name="email" placeholder="Email" fluid />
            <Password name="password" placeholder="Password" :feedback="false" fluid />
            <Button type="submit" label="Submit" />
          </Form>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Collections, type StoresRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { Button, Card, InputText, Panel, Password, Select } from 'primevue';
import { onMounted, ref, useTemplateRef } from 'vue';

const loginForm = useTemplateRef<FormInstance>('loginForm');

const stores = ref<StoresRecord[]>();
const selectedStore = ref<StoresRecord>();

const login = async (event: FormSubmitEvent) => {
  if (event.valid) {
    await pb.collection(Collections.Superusers).authWithPassword(event.values.email, event.values.password);
    if (pb.authStore.isSuperuser) {
      getStores();
    }
  }
};

const getStores = async () => {
  stores.value = await pb.collection(Collections.Stores).getFullList();
};

const splitOrderItems = async () => {
  const toSplit = await pb.collection(Collections.OrderItems).getFullList({ filter: 'quantity>1' });

  if (!toSplit.length) return;

  const totalQuantity = toSplit.reduce((sum, item) => sum + item.quantity, 0);
  console.log('Expected new record quantity: ', totalQuantity);

  const batch = pb.createBatch();

  let count = 0;
  for (const item of toSplit) {
    batch.collection(Collections.OrderItems).delete(item.id);
    for (let i = item.quantity; i > 0; i--) {
      batch.collection(Collections.OrderItems).create({ order: item.order, product: item.product, store: item.store, quantity: 1 });
      count++;
    }
  }

  if (totalQuantity === count) await batch.send();
};

onMounted(async () => {
  if (!pb.authStore.isSuperuser) {
    pb.authStore.clear();
  } else {
    await getStores();
  }
});
</script>
