<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Total Expenses" :details="totalExpenses()" is-currency />
    </div>
    <div class="col-span-12 md:col-span-3">
      <StatIndicator label="Average COGS" :details="averageCogs()" is-currency />
    </div>

    <div class="col-span-12 w-full rounded-md bg-white p-8 shadow">
      <div class="mb-2 flex items-center justify-between">
        <div class="flex gap-4 md:flex-row md:items-center">
          <span class="text-lg">Expenses</span>
        </div>
        <div class="flex items-center gap-2">
          <Button label="Profit" icon="pi pi-refresh" :loading="isRefreshProfitLoading" @click="handleRefreshProfitClick" />
          <Button label="Add" icon="pi pi-plus" @click="isAddModalVisible = true" />
        </div>
      </div>
      <ag-grid-vue ref="grid" class="h-[calc(100vh-24rem)]" :grid-options :column-defs :row-data="expenses" />
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
import { Button, Dialog, IconField, InputIcon, Select, InputNumber, InputText, Message, useToast, DatePicker } from 'primevue';
import { onMounted, reactive, ref, nextTick } from 'vue';
import type { GridOptions, ColDef, ValueFormatterParams, ValueGetterParams, ICellRendererParams } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
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
const grid = ref();

// Variables --------------------------------------------------------------------------
const toast = useToast();
const gridOptions: GridOptions<ExpensesRecord> = {
  defaultColDef: { filter: true },
  pagination: true,
  paginationPageSize: 20,
  suppressCellFocus: true,
  onModelUpdated: (e) => {
    e.api.autoSizeAllColumns();
    nextTick(() => {
      if (e.api.getAllDisplayedColumnGroups()!.reduce((acc, c) => acc + c.getActualWidth(), 0) < grid.value?.$el.clientWidth) {
        e.api.sizeColumnsToFit();
      }
    });
  }
};
const columnDefs: ColDef<ExpensesRecord>[] = [
  {
    field: 'type',
    cellRenderer: (params: ICellRendererParams) =>
      `<span class="${getTypeClass(params.data.type)} rounded-sm px-2 py-0.5 text-xs font-bold">${params.data.type}</span>`
  },
  { field: 'name' },
  { field: 'price', valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data.price) ?? '-' },
  { field: 'quantity' },
  {
    field: 'purchaseDate',
    valueGetter: (params: ValueGetterParams) => (params.data.purchaseDate ? new Date(params.data.purchaseDate).toLocaleDateString() : '-')
  },
  {
    field: 'url',
    headerName: 'URL',
    cellRenderer: (params: ICellRendererParams) => `<a class="text-blue-500" href="${params.data.url}" target="_blank">${params.data.url}</a>`
  }
];
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

const getTypeClass = (type: ExpensesTypeOptions): string => {
  switch (type) {
    case ExpensesTypeOptions.cards:
      return 'bg-green-200 text-green-600';
    case ExpensesTypeOptions.supplies:
      return 'bg-blue-200 text-blue-600';
    case ExpensesTypeOptions.other:
      return 'bg-gray-200 text-gray-600';
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
