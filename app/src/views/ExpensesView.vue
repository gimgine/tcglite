<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Total Expenses" :details="totalExpenses()" is-currency />
    </div>

    <div class="col-span-12 w-full rounded-md bg-white p-8 shadow">
      <DataTable
        :value="expenses"
        removable-sort
        filter-display="menu"
        data-key="id"
        striped-rows
        paginator
        :rows="10"
        :rows-per-page-options="[10, 25, 50, 100, 500]"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex gap-4 md:flex-row md:items-center">
              <span class="text-lg">Expenses</span>
            </div>
            <div class="flex items-center gap-2">
              <Button label="Profit" icon="pi pi-refresh" :loading="isRefreshProfitLoading" @click="handleRefreshProfitClick" />
              <Button label="Add" icon="pi pi-plus" @click="isAddModalVisible = true" />
            </div>
          </div>
        </template>
        <Column field="type" header="Type">
          <template #body="slotProps">
            <Tag :severity="getTypeSeverity(slotProps.data.type)" :value="slotProps.data.type" />
          </template>
        </Column>
        <Column field="name" header="Name" />
        <Column field="price" header="Price">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.price) }}
          </template>
        </Column>
        <Column field="quantity" header="Quantity" />
        <Column field="url" header="URL">
          <template #body="slotProps">
            <a class="text-blue-500" :href="slotProps.data.url" target="_blank">{{ slotProps.data.url }}</a>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="isAddModalVisible" modal header="Add Expense">
    <Form v-slot="$form" class="flex flex-col gap-4" :initial-values :resolver @submit="handleSubmit">
      <div class="flex items-center gap-2">
        <div class="flex flex-col gap-1">
          <InputNumber name="quantity" show-buttons button-layout="vertical" class="w-12">
            <template #incrementicon><span class="pi pi-plus" /></template>
            <template #decrementicon><span class="pi pi-minus" /></template>
          </InputNumber>
          <Message v-if="$form.quantity?.invalid" severity="error" size="small" variant="simple">{{ $form.quantity.error?.message }}</Message>
        </div>

        <div class="flex flex-col gap-1">
          <InputText name="name" placeholder="Name" fluid />
          <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error?.message }}</Message>
        </div>

        <div class="flex flex-col gap-1">
          <IconField>
            <InputIcon class="pi pi-dollar" />
            <InputNumber name="price" placeholder="Price" fluid currency="USD" mode="currency" />
          </IconField>
          <Message v-if="$form.price?.invalid" severity="error" size="small" variant="simple">{{ $form.price.error?.message }}</Message>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <IconField>
          <InputIcon class="pi pi-link" />
          <InputText name="url" placeholder="URL" fluid />
        </IconField>
        <Message v-if="$form.url?.invalid" severity="error" size="small" variant="simple">{{ $form.url.error?.message }}</Message>
      </div>
      <Button class="mt-2" type="submit" label="Submit" :loading="isSubmitLoading" />
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import StatIndicator from '@/components/StatIndicator.vue';
import { Collections, ExpensesTypeOptions, type ExpensesRecord } from '@/types/pocketbase-types';
import { formatCurrency } from '@/util/functions';
import pb from '@/util/pocketbase';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import { Button, Column, DataTable, Dialog, IconField, InputIcon, InputNumber, InputText, Message, Tag, useToast, type TagProps } from 'primevue';
import { onMounted, reactive, ref } from 'vue';
// Types ------------------------------------------------------------------------------
interface FormValues {
  quantity?: number;
  name?: string;
  price?: number;
  url?: string;
}

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------
const toast = useToast();

// Reactive Variables -----------------------------------------------------------------
const expenses = ref<ExpensesRecord[]>([]);

const isAddModalVisible = ref(false);
const isSubmitLoading = ref(false);
const isRefreshProfitLoading = ref(false);

const initialValues = reactive({
  quantity: 1,
  name: '',
  price: '',
  url: ''
});

const resolver = ({ values }: { values: FormValues }) => {
  const errors: Record<string, { message: string }[]> = {};

  if (!values.quantity) {
    errors.quantity = [{ message: 'Quantity is required' }];
  }

  if (!values.name) {
    errors.name = [{ message: 'Name is required' }];
  }

  if (!values.price) {
    errors.price = [{ message: 'Price is required.' }];
  }

  return {
    values, // (Optional) Used to pass current form values to submit event.
    errors
  };
};

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handleSubmit = async (event: FormSubmitEvent) => {
  if (event.valid) {
    console.log('Valid frfr');
  }

  isSubmitLoading.value = true;
  await pb.collection(Collections.Expenses).create(event.values);
  expenses.value = await pb.collection(Collections.Expenses).getFullList();
  event.reset();
  isSubmitLoading.value = false;
  isAddModalVisible.value = false;
};

const totalExpenses = () => {
  return expenses.value.reduce((sum, order) => sum + (order.price ?? 0), 0);
};

const getTypeSeverity = (type: ExpensesTypeOptions): TagProps['severity'] => {
  switch (type) {
    case ExpensesTypeOptions.cards:
      return 'success';
    case ExpensesTypeOptions.supplies:
      return 'info';
    case ExpensesTypeOptions.other:
      return 'secondary';
  }
};

const handleRefreshProfitClick = () => {
  isRefreshProfitLoading.value = true;

  const cardExpenses = expenses.value.filter((e) => e.type === ExpensesTypeOptions.cards);

  const totalSpentOnCards = cardExpenses.reduce((sum, expense) => sum + (expense.price ?? 0), 0);
  const quantityCardsPurchased = cardExpenses.reduce((sum, expense) => sum + (expense.quantity ?? 0), 0);
  const averageCogs = totalSpentOnCards / quantityCardsPurchased;

  toast.add({ detail: `Average COGS: ${averageCogs}` });
  isRefreshProfitLoading.value = false;
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  expenses.value = await pb.collection(Collections.Expenses).getFullList();
});
</script>
