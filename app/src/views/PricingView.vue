<template>
  <div class="grid h-screen grid-cols-12 gap-4">
    <div class="dark:border-surface-700 dark:bg-surface-900 col-span-3 rounded-md border border-gray-200 bg-white p-6 shadow">
      <div class="flex h-full flex-col justify-between gap-4">
        <div class="flex h-full flex-col gap-4">
          <span class="text-2xl font-semibold">Pricing</span>

          <div class="flex flex-col justify-between gap-3 2xl:flex-row">
            <FileUpload mode="basic" choose-label="Pricing CSV" choose-icon="pi pi-upload" accept=".csv" auto @select="handlePricingUpload" />
            <div class="flex flex-col 2xl:items-end">
              <span class="text-sm text-gray-600">Last Strategy Used</span>
              <div class="flex items-baseline gap-2">
                <span>{{ lastUsedStrategy?.name }}</span>
                <span class="text-sm text-gray-400 italic">{{ lastUsedTime }}</span>
              </div>
            </div>
          </div>

          <div class="h-[calc(100vh-32rem)] overflow-y-auto">
            <PanelMenu v-model:expanded-keys="expandedKeys" :model="items">
              <template #item="{ item }">
                <div v-if="item.isStrategy" :class="['relative', pricing.length ? 'cursor-pointer' : 'dark:bg-surface-900! bg-white!']">
                  <a :class="['flex items-center gap-2 px-4 py-2', pricing.length ? '' : 'opacity-25']">
                    <i class="pi pi-play text-primary" />
                    <span>{{ item.label }}</span>
                  </a>
                  <SpeedDial
                    :model="getStrategyOptions(item)"
                    show-icon="pi pi-ellipsis-h"
                    :button-props="{ size: 'small', rounded: true, variant: 'text', severity: 'info' }"
                    class="!absolute top-1 right-2"
                    direction="left"
                    type="semi-circle"
                    :radius="50"
                    @click.stop
                  />
                </div>

                <div v-else-if="item.isRule" :class="['relative', pricing.length ? 'cursor-pointer' : 'dark:bg-surface-900! bg-white!']">
                  <a :class="['flex items-center gap-2 px-4 py-2', pricing.length ? '' : 'opacity-25']">
                    <i class="pi pi-play text-primary" />
                    <span>{{ item.label }}</span>
                  </a>
                  <SpeedDial
                    :model="getRuleOptions(item)"
                    show-icon="pi pi-ellipsis-h"
                    :button-props="{ size: 'small', rounded: true, variant: 'text', severity: 'info' }"
                    class="!absolute top-1 right-2"
                    direction="left"
                    type="semi-circle"
                    :radius="50"
                    @click.stop
                  />
                </div>

                <a v-else class="flex cursor-pointer items-center gap-2 px-4 py-2">
                  <span v-if="item.items" :class="['pi', expandedKeys[item.key ?? ''] === true ? 'pi-angle-down' : 'pi-angle-right']"></span>
                  <span :class="item.icon"></span>
                  <span>{{ item.label }}</span>
                  <Button
                    v-tooltip="'Add new'"
                    class="ml-auto"
                    size="small"
                    variant="text"
                    rounded
                    icon="pi pi-plus"
                    @click.stop="item.key === 'strats' ? openAddStrategy() : openAddRule()"
                  />
                </a>
              </template>
            </PanelMenu>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <Fieldset legend="Pricing Stats">
            <div class="grid grid-cols-6 grid-rows-2 gap-x-10 gap-y-5">
              <div class="col-span-2 flex flex-col">
                <span class="text-sm text-gray-500">Inventory Value</span>
                <span>{{ formatCurrency(totalInventoryValue) }}</span>
              </div>
              <div class="col-span-2 flex flex-col">
                <span class="text-sm text-gray-500">Average Card Value</span>
                <span>{{ formatCurrency(averageCardValue) }}</span>
              </div>
              <div class="col-span-2 flex flex-col">
                <span class="text-sm text-gray-500">Median Card Value</span>
                <span>{{ formatCurrency(medianCardValue) }}</span>
              </div>
              <div class="col-span-2 flex flex-col">
                <span class="text-sm text-gray-500">Cards Listed</span>
                <span>{{ totalCardsListed }}</span>
              </div>
              <div class="col-span-2 flex flex-col">
                <span class="text-sm text-gray-500">Cards Below $1</span>
                <span>{{ cardsBelowOneDollar }}</span>
              </div>
              <div class="col-span-2 flex flex-col">
                <span class="text-sm text-gray-500">Cards Above $5</span>
                <span>{{ cardsAboveFiveDollars }}</span>
              </div>
            </div>
          </Fieldset>
          <Button label="Export Pricing" icon="pi pi-file-export" :disabled="!pricing.length" @click="exportPricing" />
        </div>
      </div>
    </div>

    <div class="dark:bg-surface-900 dark:border-surface-700 col-span-9 h-full rounded-md border border-gray-200 bg-white p-6 shadow">
      <ag-grid-vue ref="grid" class="h-[calc(100vh-82px)]" :grid-options :column-defs :row-data="pricing" />
    </div>

    <Dialog v-model:visible="isStrategyModalOpen" header="Strategy" modal class="w-96">
      <Form
        v-slot="$form"
        :initial-values="strategyFormInitialValues"
        :resolver="strategyFormResolver"
        class="flex flex-col gap-4"
        @submit="handleStrategySubmit"
      >
        <InputText name="name" placeholder="Strategy Name" />
        <Select
          name="addRule"
          :options="rulesOptions"
          option-label="label"
          placeholder="Add Rule"
          fluid
          @change="
            async (e) => {
              if (!strategyRules.some((sr) => sr.ruleId === e.value.ruleId)) {
                strategyRules.push(e.value);
              }
              await nextTick();
              $form.addRule.value = null;
            }
          "
        >
          <template #option="slotProps">
            <div :class="[strategyRules.some((sr) => sr.ruleId === slotProps.option.ruleId) ? 'text-gray-300' : '']">
              {{ slotProps.option.label }}
            </div>
          </template>
        </Select>
        <OrderList v-model="strategyRules" data-key="ruleId">
          <template #option="{ option, index }">
            <div class="flex w-full items-center gap-2">
              <span class="dark:bg-surface-600 rounded-full bg-gray-200 px-2">{{ index + 1 }}</span>
              <span>{{ option.label }}</span>
              <Button
                class="ml-auto"
                variant="text"
                rounded
                severity="danger"
                icon="pi pi-minus"
                size="small"
                @click.stop="strategyRules.splice(index, 1)"
              />
            </div>
          </template>
        </OrderList>
        <Button class="mt-2" type="submit" label="Submit" :loading="isSubmitLoading" />
      </Form>
    </Dialog>

    <Dialog v-model:visible="isRuleModalOpen" header="Rule" modal class="w-96">
      <Form v-slot="$form" :initial-values :resolver="ruleFormResolver" class="flex flex-col gap-4" @submit="handleRuleSubmit">
        <div class="flex gap-2">
          <div class="flex flex-col gap-1">
            <Select
              name="filter"
              :options="filterOptions"
              option-value="value"
              option-label="label"
              placeholder="Filter"
              @change="
                (e) => {
                  if (e.value === PricingRulesFilterOptions.all) $form.filterValue.value = '';
                }
              "
            />
            <Message v-if="$form.filter?.invalid" severity="error" size="small" variant="simple">{{ $form.filter.error?.message }}</Message>
          </div>
          <div class="flex w-full flex-col gap-1">
            <Select
              name="filterType"
              :options="getFilterTypeOptions($form.filter?.value)"
              option-value="value"
              option-label="label"
              placeholder="Filter Type"
              :disabled="$form.filter?.value === PricingRulesFilterOptions.all"
            />
            <Message v-if="$form.filterType?.invalid" severity="error" size="small" variant="simple">{{ $form.filterType.error?.message }}</Message>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <InputText
            name="filterValue"
            placeholder="Filter Value"
            :disabled="$form.filter?.value === PricingRulesFilterOptions.all || !$form.filterType?.value"
          />
          <Message v-if="$form.filterValue?.invalid" severity="error" size="small" variant="simple">{{ $form.filterValue.error?.message }}</Message>
        </div>

        <div class="flex flex-col gap-1">
          <InputText name="pricing" placeholder="Pricing Formula" />
          <Message v-if="$form.pricing?.invalid" severity="error" size="small" variant="simple">{{ $form.pricing.error?.message }}</Message>
        </div>

        <Button class="mt-2" type="submit" label="Submit" :loading="isSubmitLoading" />
      </Form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useAgGridTheme } from '@/composables/useAgGridTheme';
import { Collections, PricingRulesFilterOptions, type PricingRulesRecord, type PricingStrategiesRecord } from '@/types/pocketbase-types';
import { parsePricingCsv, type PricingCsv } from '@/util/csv-parse';
import { formatCurrency } from '@/util/functions';
import pb from '@/util/pocketbase';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import { type ColDef, type GridOptions, type ValueFormatterParams } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import Papa from 'papaparse';
import {
  Button,
  Dialog,
  Fieldset,
  FileUpload,
  InputText,
  Message,
  OrderList,
  PanelMenu,
  Select,
  SpeedDial,
  useToast,
  type FileUploadSelectEvent
} from 'primevue';
import type { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem';
import { computed, nextTick, onMounted, reactive, ref } from 'vue';

// Types ------------------------------------------------------------------------------
enum PricingRulesFilterTypes {
  'equals' = 'equals',
  'not_equal' = 'does not equal',
  'contains' = 'contains',
  'not_contain' = 'does not contain',
  'begins' = 'begins with',
  'ends' = 'ends with',
  'greater' = 'greater than',
  'greater_equal' = 'greater than or equal',
  'less' = 'less than',
  'less_equal' = 'less than or equal'
}

interface RuleFormValues {
  filter?: PricingRulesFilterOptions;
  filterType?: PricingRulesFilterTypes;
  filterValue?: string;
  pricing?: string;
}

interface StrategyFormValues {
  name?: string;
}

interface Option<T> {
  label: string;
  value: T;
}

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const grid = ref();

// Variables --------------------------------------------------------------------------
const theme = useAgGridTheme();

const gridOptions: GridOptions<PricingCsv> = {
  defaultColDef: { filter: true },
  theme: theme.value,
  pagination: true,
  paginationPageSize: 20,
  rowSelection: { mode: 'multiRow', selectAll: 'filtered' },
  suppressCellFocus: true,
  onModelUpdated: (e) => {
    e.api.autoSizeAllColumns();
    nextTick(() => {
      if (e.api.getAllDisplayedColumnGroups()!.reduce((acc, c) => acc + c.getActualWidth(), 0) < grid.value?.$el.clientWidth) {
        e.api.sizeColumnsToFit();
      }
    });
  },
  onSelectionChanged: (e) => {
    selectedRows.value = e.api.getSelectedRows();
  }
};
const columnDefs: ColDef<PricingCsv>[] = [
  { field: 'TCGplayer Id', headerName: 'ID', hide: true },
  { field: 'Set Name', headerName: 'Set' },
  { field: 'Product Name', headerName: 'Name' },
  { field: 'Number' },
  { field: 'Rarity', hide: true },
  { field: 'Condition' },
  {
    field: 'TCG Market Price',
    headerName: 'Market Price',
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Market Price']) ?? ''
  },
  {
    field: 'TCG Direct Low',
    headerName: 'Direct Low',
    hide: true,
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Direct Low']) ?? ''
  },
  {
    field: 'TCG Low Price With Shipping',
    headerName: 'Low Shipping',
    hide: true,
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Low Price With Shipping']) ?? ''
  },
  { field: 'TCG Low Price', headerName: 'Low', valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Low Price']) ?? '' },
  {
    field: 'TCG Marketplace Price',
    headerName: 'Our Price',
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.data['TCG Marketplace Price']) ?? '',
    editable: true,
    singleClickEdit: true
  },
  { field: 'Total Quantity', headerName: 'Quantity' }
];

const filterOptions: Array<Option<PricingRulesFilterOptions>> = [
  { label: 'All', value: PricingRulesFilterOptions.all },
  { label: 'Set', value: PricingRulesFilterOptions.set },
  { label: 'Quantity', value: PricingRulesFilterOptions.quantity },
  { label: 'Market Price', value: PricingRulesFilterOptions.market },
  { label: 'Low Price', value: PricingRulesFilterOptions.low },
  { label: 'Our Price', value: PricingRulesFilterOptions.our }
];

const stringFilterTypes: Array<Option<PricingRulesFilterTypes>> = [
  { label: 'Equals', value: PricingRulesFilterTypes.equals },
  { label: 'Does Not Equal', value: PricingRulesFilterTypes.not_equal },
  { label: 'Contains', value: PricingRulesFilterTypes.contains },
  { label: 'Does Not Contain', value: PricingRulesFilterTypes.not_contain },
  { label: 'Begins With', value: PricingRulesFilterTypes.begins },
  { label: 'Ends With', value: PricingRulesFilterTypes.ends }
];

const numberFilterTypes: Array<Option<PricingRulesFilterTypes>> = [
  { label: 'Equals', value: PricingRulesFilterTypes.equals },
  { label: 'Does Not Equal', value: PricingRulesFilterTypes.not_equal },
  { label: 'Greater Than', value: PricingRulesFilterTypes.greater },
  { label: 'Greater Than or Equal', value: PricingRulesFilterTypes.greater_equal },
  { label: 'Less Than', value: PricingRulesFilterTypes.less },
  { label: 'Less Than or Equal', value: PricingRulesFilterTypes.less_equal }
];

const filterOptionsToProperty: Partial<Record<PricingRulesFilterOptions, keyof PricingCsv>> = {
  set: 'Set Name',
  quantity: 'Total Quantity',
  market: 'TCG Market Price',
  low: 'TCG Low Price',
  our: 'TCG Marketplace Price'
};

const filters: Record<PricingRulesFilterTypes, (value: string, filterValue: string) => boolean> = {
  equals: (value, filterValue) => value === filterValue,
  'does not equal': (value, filterValue) => value !== filterValue,
  contains: (value, filterValue) => value.includes(filterValue),
  'does not contain': (value, filterValue) => !value.includes(filterValue),
  'begins with': (value, filterValue) => value.startsWith(filterValue),
  'ends with': (value, filterValue) => value.endsWith(filterValue),
  'greater than': (value, filterValue) => Number(value) > Number(filterValue),
  'greater than or equal': (value, filterValue) => Number(value) >= Number(filterValue),
  'less than': (value, filterValue) => Number(value) < Number(filterValue),
  'less than or equal': (value, filterValue) => Number(value) <= Number(filterValue)
};

const defaultRuleFormValues = {
  filter: PricingRulesFilterOptions.all,
  filterType: undefined,
  filterValue: '',
  pricing: ''
};

const defaultStrategyFormValues = {
  name: ''
};
// Reactive Variables -----------------------------------------------------------------
const toast = useToast();

const pricing = ref<PricingCsv[]>([]);

const selectedRows = ref<PricingCsv[]>([]);

const isStrategyModalOpen = ref(false);
const isRuleModalOpen = ref(false);
const isSubmitLoading = ref(false);

const editingStrategyId = ref();
const editingRuleId = ref();

const isEditRule = computed(() => editingRuleId.value);
const isEditStrategy = computed(() => editingStrategyId.value);

const editingStrategyRules = ref<Array<{ label: string; ruleId: string; strategyRuleId?: string }>>([]); // cache original strategy rules for deletion
const strategyRules = ref<Array<{ label: string; ruleId: string; strategyRuleId?: string }>>([]);
const rulesOptions = ref<Array<{ label: string; ruleId: string }>>([]);

const lastUsedStrategy = ref<PricingStrategiesRecord>();
const lastUsedTime = computed(() => {
  dayjs.extend(relativeTime);
  return dayjs(lastUsedStrategy.value?.lastUsed).fromNow();
});

const items = ref<{ key: string; label: string; icon: string; items?: { isStrategy?: boolean; isRule?: boolean; label: string; id: string }[] }[]>([
  {
    key: 'strats',
    label: 'Strategies',
    icon: 'pi pi-database',
    items: undefined
  },
  {
    key: 'rules',
    label: 'Rules',
    icon: 'pi pi-dollar',
    items: undefined
  }
]);

const expandedKeys = ref<Record<string, boolean>>({ strats: true });

const initialValues = reactive<Partial<PricingRulesRecord>>({ ...defaultRuleFormValues });
const strategyFormInitialValues = reactive({ ...defaultStrategyFormValues });

const areInventoryStatsVisible = ref(false);

const totalCardsListed = computed(() => {
  return pricing.value.reduce((sum, card) => sum + card['Total Quantity'], 0);
});

const totalInventoryValue = computed(() => {
  return pricing.value.reduce((sum, card) => sum + card['TCG Marketplace Price'] * card['Total Quantity'], 0);
});

const averageCardValue = computed(() => {
  const totalCards = totalCardsListed.value;
  return totalCards > 0 ? totalInventoryValue.value / totalCards : 0;
});

const medianCardValue = computed(() => {
  const values: number[] = [];

  pricing.value.forEach((card) => {
    for (let i = 0; i < card['Total Quantity']; i++) {
      values.push(card['TCG Marketplace Price']);
    }
  });

  if (values.length === 0) return 0;

  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);

  if (values.length % 2 === 0) {
    return (values[mid - 1] + values[mid]) / 2;
  } else {
    return values[mid];
  }
});

const cardsBelowOneDollar = computed(() => {
  return pricing.value.reduce((count, card) => (card['TCG Marketplace Price'] < 1 ? count + card['Total Quantity'] : count), 0);
});

const cardsAboveFiveDollars = computed(() => {
  return pricing.value.reduce((count, card) => (card['TCG Marketplace Price'] > 5 ? count + card['Total Quantity'] : count), 0);
});

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handlePricingUpload = async (event: FileUploadSelectEvent) => {
  const parsedPricing = await parsePricingCsv(event.files[0]);
  pricing.value = parsedPricing;
  areInventoryStatsVisible.value = true;
};

const openAddStrategy = async () => {
  const rules = await pb.collection(Collections.PricingRules).getFullList();

  editingStrategyId.value = null;
  strategyFormInitialValues.name = defaultStrategyFormValues.name;
  rulesOptions.value = rules.map((r) => ({ label: getRuleLabel(r), ruleId: r.id }));
  strategyRules.value = [];

  isStrategyModalOpen.value = true;
};

const openEditStrategy = async (id: string) => {
  const rulesRes = await pb.collection(Collections.PricingRules).getFullList();
  const strategyRes = await pb.collection(Collections.PricingStrategies).getOne(id);
  const strategyRulesRes = await pb.collection(Collections.StrategyRules).getFullList({ filter: `strategy="${id}"`, sort: 'order' });

  editingStrategyId.value = id;

  strategyFormInitialValues.name = strategyRes.name;
  strategyRules.value = strategyRulesRes.map((srr) => {
    const rule = rulesRes.find((r) => r.id === srr.rule);
    return { label: getRuleLabel(rule), ruleId: srr.rule, strategyRuleId: srr.id };
  });
  editingStrategyRules.value = [...strategyRules.value];

  rulesOptions.value = rulesRes.map((r) => ({ label: getRuleLabel(r), ruleId: r.id }));

  isStrategyModalOpen.value = true;
};

const openAddRule = () => {
  editingRuleId.value = null;

  initialValues.filter = defaultRuleFormValues.filter;
  initialValues.filterValue = defaultRuleFormValues.filterValue;
  initialValues.pricing = defaultRuleFormValues.pricing;

  isRuleModalOpen.value = true;
};

const openEditRule = async (id: string) => {
  const ruleRes = await pb.collection(Collections.PricingRules).getOne(id);

  initialValues.filter = ruleRes.filter;
  initialValues.filterType = ruleRes.filterType;
  initialValues.filterValue = ruleRes.filterValue;
  initialValues.pricing = ruleRes.pricing;

  editingRuleId.value = id;

  isRuleModalOpen.value = true;
};

const getFilterTypeOptions = (filter?: PricingRulesFilterOptions) => {
  if (filter === 'set') return stringFilterTypes;
  return numberFilterTypes;
};

const strategyFormResolver = ({ values }: { values: StrategyFormValues }) => {
  const errors: Record<string, { message: string }[]> = {};

  if (!values.name) {
    errors.name = [{ message: 'Strategy name is required' }];
  }

  return {
    values,
    errors
  };
};

const ruleFormResolver = ({ values }: { values: RuleFormValues }) => {
  const errors: Record<string, { message: string }[]> = {};

  if (!values.filter) {
    errors.filter = [{ message: 'Filter is required' }];
  }

  if (!values.filterValue && values.filter !== 'all') {
    errors.filterValue = [{ message: 'Filter value is required' }];
  }

  if (!values.pricing) {
    errors.pricing = [{ message: 'Pricing is required' }];
  } else if (!/^[0-9lm+\-*/().]+$/.test(values.pricing)) {
    errors.pricing = [{ message: 'The formula only allows numbers, l, m, and basic math symbols.' }];
  } else {
    try {
      eval(values.pricing.replace('l', '1').replace('m', '1'));
    } catch {
      errors.pricing = [{ message: 'Error evaluating formula' }];
    }
  }

  return {
    values,
    errors
  };
};

const handleRuleSubmit = async (event: FormSubmitEvent) => {
  if (event.valid && pb.authStore.isValid) {
    isSubmitLoading.value = true;
    if (isEditRule.value) {
      await pb.collection(Collections.PricingRules).update(editingRuleId.value, { store: pb.authStore.record?.store, ...event.values });
    } else {
      await pb.collection(Collections.PricingRules).create({ store: pb.authStore.record?.store, ...event.values });
    }
    await refreshRules();
    event.reset();
    isSubmitLoading.value = false;
    isRuleModalOpen.value = false;
  }
};

const handleStrategySubmit = async (event: FormSubmitEvent) => {
  if (event.valid && pb.authStore.isValid) {
    isSubmitLoading.value = true;
    if (isEditStrategy.value) {
      await pb.collection(Collections.PricingStrategies).update(editingStrategyId.value, { store: pb.authStore.record?.store, ...event.values });

      editingStrategyRules.value.forEach(async (sr) => {
        if (sr.strategyRuleId) await pb.collection(Collections.StrategyRules).delete(sr.strategyRuleId);
      });

      const strategyRulesReqs = strategyRules.value.map((sr, i) => ({
        strategy: editingStrategyId.value,
        rule: sr.ruleId,
        order: i,
        store: pb.authStore.record?.store
      }));
      const batch = pb.createBatch();
      strategyRulesReqs.forEach((req) => {
        batch.collection(Collections.StrategyRules).create(req);
      });
      await batch.send();
    } else {
      const stratCreateRes = await pb.collection(Collections.PricingStrategies).create({ store: pb.authStore.record?.store, ...event.values });

      const strategyRulesReqs = strategyRules.value.map((sr, i) => ({
        strategy: stratCreateRes.id,
        rule: sr.ruleId,
        order: i,
        store: pb.authStore.record?.store
      }));
      const batch = pb.createBatch();
      strategyRulesReqs.forEach((req) => {
        batch.collection(Collections.StrategyRules).create(req);
      });
      await batch.send();
    }
    await refreshStrategies();
    event.reset();
    isSubmitLoading.value = false;
    isStrategyModalOpen.value = false;
  }
};

const runStrategy = async (id: string) => {
  if (!pricing.value.length) return;

  const strategyRules = await pb.collection(Collections.StrategyRules).getFullList({ filter: `strategy="${id}"`, sort: 'order' });

  await pb.collection(Collections.PricingStrategies).update(id, { lastUsed: new Date() });

  for (const sr of strategyRules) {
    await runPricingRule(sr.rule);
  }

  await refreshLastUsed();
};

const runPricingRule = async (id: string) => {
  if (!pricing.value.length) return;

  const rule = await pb.collection(Collections.PricingRules).getOne(id);

  let filtered;

  if (rule.filter === PricingRulesFilterOptions.all) {
    filtered = pricing.value;
  } else {
    const filter = filters[rule.filterType] as (...args: unknown[]) => boolean;
    const property = filterOptionsToProperty[rule.filter]!;
    filtered = pricing.value.filter((p) => filter(p[property], rule.filterValue));
  }

  if (!filtered) {
    toast.add({
      severity: 'error',
      summary: 'Invalid Rule',
      detail: 'The filter specified in the pricing rule is not supported.',
      life: 3000
    });
    return;
  }

  updatePricing(filtered, rule.pricing);
};

const deleteRule = async (id: string) => {
  const strategyRulesForRule = await pb.collection(Collections.StrategyRules).getFullList({ filter: `rule="${id}"` });
  if (strategyRulesForRule.length) {
    toast.add({
      severity: 'warn',
      summary: 'Rule In Use',
      detail: `Could not delete rule, it is being used by at least one strategy.`,
      life: 5000
    });
    return;
  } else {
    await pb.collection(Collections.PricingRules).delete(id);
  }

  await refreshRules();
};

const deleteStrategy = async (id: string) => {
  const strategyRulesToDelete = await pb.collection(Collections.StrategyRules).getFullList({ filter: `strategy="${id}"` });
  const batch = pb.createBatch();
  strategyRulesToDelete.forEach((sr) => {
    batch.collection(Collections.StrategyRules).delete(sr.id);
  });
  batch.send();

  await pb.collection(Collections.PricingStrategies).delete(id);

  await refreshStrategies();
};

const updatePricing = (rows: PricingCsv[], formula: string) => {
  if (!/^[0-9lm+\-*/().]+$/.test(formula))
    return toast.add({
      severity: 'error',
      summary: 'Invalid Formula',
      detail: 'The formula only allows numbers, l, m, and basic math symbols.',
      life: 3000
    });
  try {
    eval(formula.replace('l', '1').replace('m', '1'));
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error Evaluating Formula',
      detail: e,
      life: 3000
    });
    return;
  }
  const errorRows: PricingCsv[] = [];
  rows.forEach((product) => {
    try {
      const value = eval(formula.replace('l', `${product['TCG Low Price']}`).replace('m', `${product['TCG Market Price']}`));
      product['TCG Marketplace Price'] = +Math.max(product['TCG Low Price'], value).toFixed(2);
    } catch {
      errorRows.push(product);
    }
  });
  if (rows.length - errorRows.length > 0)
    toast.add({
      severity: 'success',
      summary: 'Updated Prices',
      detail: `Successfully updated the prices for ${rows.length - errorRows.length} records.`,
      life: 3000
    });
  if (errorRows.length > 0)
    toast.add({
      severity: 'error',
      summary: 'Error Updating Prices',
      detail: `There was an error updating the price for the records with the following IDs: \n ${errorRows.map((r) => r['TCGplayer Id'])}`
    });
};

const exportPricing = () => {
  pricing.value.forEach((p) => (p['Add to Quantity'] = 0));

  const sanitized = pricing.value.map((row) => {
    const sanitizedRow: Record<string, string | number> = {};

    for (const key in row) {
      const value = (row as Record<string, string | number>)[key];
      sanitizedRow[key] = value === null ? '' : value;
    }

    return sanitizedRow;
  });

  const csv = Papa.unparse(sanitized, { quotes: true });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'updated_pricing.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const refreshRules = async () => {
  const rules = await pb.collection(Collections.PricingRules).getFullList();
  items.value[1].items = rules.map((r) => ({
    isRule: true,
    label: getRuleLabel(r),
    id: r.id,
    command: () => runPricingRule(r.id)
  }));
};

const refreshStrategies = async () => {
  const strategies = await pb.collection(Collections.PricingStrategies).getFullList();
  items.value[0].items = strategies.map((s) => ({ isStrategy: true, label: s.name, id: s.id, command: () => runStrategy(s.id) }));
};

const refreshLastUsed = async () => {
  const strategies = await pb.collection(Collections.PricingStrategies).getFullList();
  const mostRecentStrategy = strategies.reduce((latest: (typeof strategies)[number] | null, current) => {
    if (!current.lastUsed) return latest;
    if (!latest) return current;
    return dayjs(current.lastUsed).isAfter(dayjs(latest.lastUsed)) ? current : latest;
  }, null);

  lastUsedStrategy.value = mostRecentStrategy as PricingStrategiesRecord;
};

const getStrategyOptions = (item: MenuItem) => [
  { visible: false },
  {
    label: 'Delete',
    icon: 'pi pi-trash text-red-500',
    command: (event: MenuItemCommandEvent) => {
      event.originalEvent.stopPropagation();
      deleteStrategy(item.id);
    }
  },
  {
    label: 'Edit',
    icon: 'pi pi-pencil text-yellow-500',
    command: (event: MenuItemCommandEvent) => {
      event.originalEvent.stopPropagation();
      openEditStrategy(item.id);
    }
  },
  { visible: false }
];

const getRuleOptions = (item: MenuItem) => [
  { visible: false },
  {
    label: 'Delete',
    icon: 'pi pi-trash text-red-500',
    command: (event: MenuItemCommandEvent) => {
      event.originalEvent.stopPropagation();
      deleteRule(item.id);
    }
  },
  {
    label: 'Edit',
    icon: 'pi pi-pencil text-yellow-500',
    command: (event: MenuItemCommandEvent) => {
      event.originalEvent.stopPropagation();
      openEditRule(item.id);
    }
  },
  { visible: false }
];

const getRuleLabel = (rule?: PricingRulesRecord) => (rule ? `${rule?.pricing} for ${rule?.filter} ${rule.filterType} ${rule?.filterValue}` : '');

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  await refreshStrategies();
  await refreshRules();
  await refreshLastUsed();
});
</script>
