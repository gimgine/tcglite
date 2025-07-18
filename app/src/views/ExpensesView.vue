<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Total Expenses" :details="totalExpenses()" is-currency />
    </div>
    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Average COGS" :details="averageCogs()" is-currency />
    </div>

    <div class="col-span-12 w-full rounded-md bg-white p-8 shadow">
      <DataTable
        :value="expenses"
        removable-sort
        filter-display="menu"
        data-key="id"
        striped-rows
        paginator
        :rows="25"
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
        <Column field="type" header="Type" sortable>
          <template #body="slotProps">
            <Tag :severity="getTypeSeverity(slotProps.data.type)" :value="slotProps.data.type" />
          </template>
        </Column>
        <Column field="name" header="Name" sortable />
        <Column field="price" header="Price" sortable>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.price) }}
          </template>
        </Column>
        <Column field="quantity" header="Quantity" sortable />
        <Column field="purchaseDate" header="Purchase Date" sortable>
          <template #body="slotProps">
            {{ slotProps.data.purchaseDate ? new Date(slotProps.data.purchaseDate).toLocaleDateString() : '' }}
          </template>
        </Column>
        <Column field="url" header="URL" sortable>
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
          <Select name="type" :options="typeOptions" option-value="value" option-label="label" placeholder="Type" />
          <Message v-if="$form.type?.invalid" severity="error" size="small" variant="simple">{{ $form.type.error?.message }}</Message>
        </div>
        <div class="flex w-full flex-col gap-1">
          <InputText name="name" placeholder="Name" />
          <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error?.message }}</Message>
        </div>
      </div>

      <div class="flex w-full items-center gap-2">
        <div class="flex w-full flex-col gap-1">
          <IconField>
            <InputIcon class="pi pi-dollar" />
            <InputNumber name="price" placeholder="Price" fluid currency="USD" mode="currency" />
          </IconField>
          <Message v-if="$form.price?.invalid" severity="error" size="small" variant="simple">{{ $form.price.error?.message }}</Message>
        </div>

        <div class="flex w-full flex-col gap-1">
          <InputNumber name="quantity" placeholder="Quantity" />
          <Message v-if="$form.quantity?.invalid" severity="error" size="small" variant="simple">{{ $form.quantity.error?.message }}</Message>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex flex-col gap-1">
          <IconField>
            <InputIcon class="pi pi-calendar" />
            <DatePicker name="purchaseDate" placeholder="Purchase Date" />
          </IconField>
          <Message v-if="$form.purchaseDate?.invalid" severity="error" size="small" variant="simple">{{ $form.purchaseDate.error?.message }}</Message>
        </div>

        <div class="flex flex-col gap-1">
          <IconField>
            <InputIcon class="pi pi-link" />
            <InputText name="url" placeholder="URL" fluid />
          </IconField>
          <Message v-if="$form.url?.invalid" severity="error" size="small" variant="simple">{{ $form.url.error?.message }}</Message>
        </div>
      </div>

      <Button class="mt-2" type="submit" label="Submit" :loading="isSubmitLoading" />
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import StatIndicator from '@/components/StatIndicator.vue';
import { OrderService } from '@/service/order-service';
import { useOrderStore } from '@/store/order-store';
import { Collections, ExpensesTypeOptions, type ExpensesRecord } from '@/types/pocketbase-types';
import { formatCurrency } from '@/util/functions';
import pb from '@/util/pocketbase';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import {
  Button,
  Column,
  DataTable,
  Dialog,
  IconField,
  InputIcon,
  Select,
  InputNumber,
  InputText,
  Message,
  Tag,
  useToast,
  DatePicker,
  type TagProps
} from 'primevue';
import { onMounted, reactive, ref } from 'vue';
// Types ------------------------------------------------------------------------------
interface FormValues {
  type?: string;
  quantity?: number;
  name?: string;
  price?: number;
  url?: string;
  purchaseDate?: Date;
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
  type: null,
  quantity: null,
  name: '',
  price: '',
  url: '',
  purchaseDate: ''
});

const typeOptions = [
  { label: 'Cards', value: 'cards' },
  { label: 'Supplies', value: 'supplies' },
  { label: 'Other', value: 'other' }
];

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const resolver = ({ values }: { values: FormValues }) => {
  const errors: Record<string, { message: string }[]> = {};

  if (!values.type) {
    errors.type = [{ message: 'Type is required' }];
  }

  if (!values.quantity) {
    errors.quantity = [{ message: 'Quantity is required' }];
  }

  if (!values.name) {
    errors.name = [{ message: 'Name is required' }];
  }

  if (!values.price) {
    errors.price = [{ message: 'Price is required' }];
  }

  if (values.type === 'cards' && !values.purchaseDate) {
    errors.purchaseDate = [{ message: 'Purchase date is required for card expenses' }];
  }

  return {
    values, // (Optional) Used to pass current form values to submit event.
    errors
  };
};

const handleSubmit = async (event: FormSubmitEvent) => {
  if (event.valid) {
    isSubmitLoading.value = true;
    await pb.collection(Collections.Expenses).create(event.values);
    expenses.value = await pb.collection(Collections.Expenses).getFullList();
    event.reset();
    isSubmitLoading.value = false;
    isAddModalVisible.value = false;
  }
};

const totalExpenses = () => {
  return expenses.value.reduce((sum, order) => sum + (order.price ?? 0), 0);
};

const averageCogs = () => {
  const cardExpenses = expenses.value.filter((e) => e.type === ExpensesTypeOptions.cards);
  const totalSpentOnCards = cardExpenses.reduce((sum, expense) => sum + (expense.price ?? 0), 0);
  const quantityCardsPurchased = cardExpenses.reduce((sum, expense) => sum + (expense.quantity ?? 0), 0);
  return totalSpentOnCards / quantityCardsPurchased;
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

const handleRefreshProfitClick = async () => {
  isRefreshProfitLoading.value = true;

  const cardExpenses = expenses.value.filter((e) => e.type === ExpensesTypeOptions.cards && e.purchaseDate);

  cardExpenses.sort((a, b) => new Date(a.purchaseDate ?? '').getTime() - new Date(b.purchaseDate ?? '').getTime());

  let totalSpent = 0;
  let totalQuantity = 0;

  const historicalCogs: { date: string; averageCogs: number }[] = [];

  for (const expense of cardExpenses) {
    const quantity = expense.quantity ?? 0;
    const price = expense.price ?? 0;

    totalSpent += price;
    totalQuantity += quantity;

    if (totalQuantity === 0) continue;

    const averageCogs = totalSpent / totalQuantity;

    historicalCogs.push({
      date: expense.purchaseDate!,
      averageCogs
    });
  }

  const orderService = new OrderService();
  await orderService.refreshProfit(historicalCogs);

  const orderStore = useOrderStore();
  await orderStore.refresh();
  toast.add({ summary: 'Profit Refresh', detail: 'Profit calculations were refreshed for all orders.', severity: 'success', life: 3000 });

  isRefreshProfitLoading.value = false;
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  expenses.value = await pb.collection(Collections.Expenses).getFullList();
});
</script>
