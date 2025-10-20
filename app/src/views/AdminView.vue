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
              <Button label="Claim All Records" fluid :loading="isClaimLoading" @click="claimRecords" />
            </div>
          </Panel>
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
import { Card, Button, useToast, InputText, Password, Select, Panel } from 'primevue';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import { onMounted, ref, useTemplateRef } from 'vue';

const toast = useToast();

const loginForm = useTemplateRef<FormInstance>('loginForm');

const stores = ref<StoresRecord[]>();
const selectedStore = ref<StoresRecord>();
const isClaimLoading = ref(false);

const claimRecords = async () => {
  isClaimLoading.value = true;

  const storeId = selectedStore.value?.id;

  if (!storeId) {
    toast.add({ summary: 'Error', detail: 'No store selected.', life: 3000, severity: 'error' });
    return;
  }

  const orders = await pb.collection(Collections.Orders).getFullList();
  const cards = await pb.collection(Collections.Cards).getFullList();
  const expenses = await pb.collection(Collections.Expenses).getFullList();
  const pricingRules = await pb.collection(Collections.PricingRules).getFullList();
  const pricingStrategies = await pb.collection(Collections.PricingStrategies).getFullList();
  const strategyRules = await pb.collection(Collections.StrategyRules).getFullList();

  const batch = pb.createBatch();

  orders.forEach((order) => {
    order.store = storeId;
    batch.collection(Collections.Orders).update(order.id, order);
  });

  cards.forEach((card) => {
    card.store = storeId;
    batch.collection(Collections.Cards).update(card.id, card);
  });

  expenses.forEach((expense) => {
    expense.store = storeId;
    batch.collection(Collections.Expenses).update(expense.id, expense);
  });

  pricingRules.forEach((rule) => {
    rule.store = storeId;
    batch.collection(Collections.PricingRules).update(rule.id, rule);
  });

  pricingStrategies.forEach((strategy) => {
    strategy.store = storeId;
    batch.collection(Collections.PricingStrategies).update(strategy.id, strategy);
  });

  strategyRules.forEach((strategyRule) => {
    strategyRule.store = storeId;
    batch.collection(Collections.StrategyRules).update(strategyRule.id, strategyRule);
  });

  try {
    await batch.send();
    toast.add({ summary: 'Claimed', detail: 'All records claimed for selected store.', life: 3000, severity: 'success' });
  } catch {
    toast.add({ summary: 'Error', detail: 'Something went wrong claiming records.', life: 3000, severity: 'error' });
  } finally {
    isClaimLoading.value = false;
  }
};

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

onMounted(async () => {
  if (!pb.authStore.isSuperuser) {
    pb.authStore.clear();
  } else {
    await getStores();
  }
});
</script>
