<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-3 rounded-md bg-white p-6 shadow">
      <div class="flex h-full flex-col justify-between">
        <div class="flex h-full flex-col gap-4">
          <FileUpload mode="basic" choose-label="Pricing CSV" choose-icon="pi pi-upload" accept=".csv" auto @select="handlePricingUpload" />

          <PanelMenu v-model:expanded-keys="expandedKeys" :model="items">
            <template #item="{ item }">
              <a v-if="item.isRule" class="flex items-center bg-white! px-4 py-2">
                <span>{{ item.label }}</span>
                <Button
                  v-tooltip="'Delete'"
                  class="ml-auto"
                  size="small"
                  icon="pi pi-trash"
                  variant="text"
                  severity="danger"
                  rounded
                  @click="deleteRule(item.id)"
                />
                <Button v-tooltip="'Edit'" size="small" icon="pi pi-pencil" variant="text" severity="warn" rounded @click="openEditRule(item.id)" />
                <Button v-tooltip="'Apply Pricing'" size="small" icon="pi pi-play" variant="text" rounded @click="runPricingRule(item.id)" />
              </a>
              <a v-else-if="item.isStrategy" class="flex items-center bg-white! px-4 py-2">
                <span>{{ item.label }}</span>
                <Button
                  v-tooltip="'Delete'"
                  class="ml-auto"
                  size="small"
                  icon="pi pi-trash"
                  variant="text"
                  severity="danger"
                  rounded
                  @click="deleteStrategy(item.id)"
                />
                <Button
                  v-tooltip="'Edit'"
                  size="small"
                  icon="pi pi-pencil"
                  variant="text"
                  severity="warn"
                  rounded
                  @click="openEditStrategy(item.id)"
                />
                <Button v-tooltip="'Apply Pricing'" size="small" icon="pi pi-play" variant="text" rounded @click="runStrategy(item.id)" />
              </a>
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

        <Button label="Export Pricing" icon="pi pi-file-export" @click="exportPricing" />
      </div>
    </div>

    <div class="col-span-9 h-full rounded-md bg-white p-6">
      <ag-grid-vue ref="grid" class="h-[calc(100vh-12rem)]" :grid-options :column-defs :row-data="pricing" />
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
          >r
          <template #option="slotProps">
            <div :class="[strategyRules.some((sr) => sr.ruleId === slotProps.option.ruleId) ? 'text-gray-300' : '']">
              {{ slotProps.option.label }}
            </div>
          </template>
        </Select>
        <OrderList v-model="strategyRules" data-key="ruleId">
          <template #option="{ option, index }">
            <div class="flex w-full items-center gap-2">
              <span class="rounded-full bg-gray-200 px-2">{{ index + 1 }}</span>
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

    <Dialog v-model:visible="isRuleModalOpen" header="Rule" modal>
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
          <div class="flex flex-col gap-1">
            <InputText name="filterValue" placeholder="Filter Value" :disabled="$form.filter?.value === PricingRulesFilterOptions.all" />
            <Message v-if="$form.filterValue?.invalid" severity="error" size="small" variant="simple">{{ $form.filterValue.error?.message }}</Message>
          </div>
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
import { Collections, PricingRulesFilterOptions } from '@/types/pocketbase-types';
import { parsePricingCsv, type PricingCsv } from '@/util/csv-parse';
import { formatCurrency } from '@/util/functions';
import pb from '@/util/pocketbase';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import { themeQuartz, type ColDef, type GridOptions, type ValueFormatterParams } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import Papa from 'papaparse';
import { Button, Dialog, FileUpload, InputText, Message, OrderList, PanelMenu, Select, useToast, type FileUploadSelectEvent } from 'primevue';
import { computed, nextTick, onMounted, reactive, ref } from 'vue';

// Types ------------------------------------------------------------------------------
interface RuleFormValues {
  filter?: PricingRulesFilterOptions;
  filterValue?: string;
  pricing?: string;
}

interface StrategyFormValues {
  name?: string;
}

type FilterOperator = '>' | '<' | '>=' | '<=' | '==';

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------
const grid = ref();

// Variables --------------------------------------------------------------------------
const gridOptions: GridOptions<PricingCsv> = {
  defaultColDef: { filter: true },
  theme: themeQuartz,
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

const filterOptions: Array<{ label: string; value: PricingRulesFilterOptions }> = [
  { label: 'All', value: PricingRulesFilterOptions.all },
  { label: 'Set', value: PricingRulesFilterOptions.set },
  { label: 'Quantity', value: PricingRulesFilterOptions.quantity },
  { label: 'Market Price', value: PricingRulesFilterOptions.market },
  { label: 'Low Price', value: PricingRulesFilterOptions.low }
];

const defaultRuleFormValues = {
  filter: 'all',
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

const strategyRules = ref<Array<{ label: string; ruleId: string; strategyRuleId?: string }>>([]);
const rulesOptions = ref<Array<{ label: string; ruleId: string }>>([]);

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

const initialValues = reactive({ ...defaultRuleFormValues });
const strategyFormInitialValues = reactive({ ...defaultStrategyFormValues });

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const handlePricingUpload = async (event: FileUploadSelectEvent) => {
  const parsedPricing = await parsePricingCsv(event.files[0]);
  pricing.value = parsedPricing;
};

const openAddStrategy = async () => {
  const rules = await pb.collection(Collections.PricingRules).getFullList();

  rulesOptions.value = rules.map((r) => ({ label: `${r.pricing} for ${r.filter} ${r.filterValue}`, ruleId: r.id }));
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
    return { label: `${rule?.pricing} for ${rule?.filter} ${rule?.filterValue}`, ruleId: srr.rule, strategyRuleId: srr.id };
  });

  rulesOptions.value = rulesRes.map((r) => ({ label: `${r.pricing} for ${r.filter} ${r.filterValue}`, ruleId: r.id }));

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
  initialValues.filterValue = ruleRes.filterValue;
  initialValues.pricing = ruleRes.pricing;

  editingRuleId.value = id;

  isRuleModalOpen.value = true;
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
  if (event.valid) {
    isSubmitLoading.value = true;
    if (isEditRule.value) {
      await pb.collection(Collections.PricingRules).update(editingRuleId.value, event.values);
    } else {
      await pb.collection(Collections.PricingRules).create(event.values);
    }
    await refreshRules();
    event.reset();
    isSubmitLoading.value = false;
    isRuleModalOpen.value = false;
  }
};

const handleStrategySubmit = async (event: FormSubmitEvent) => {
  if (event.valid) {
    isSubmitLoading.value = true;
    if (isEditStrategy.value) {
      await pb.collection(Collections.PricingStrategies).update(editingStrategyId.value, event.values);

      strategyRules.value.forEach(async (sr) => {
        if (sr.strategyRuleId) await pb.collection(Collections.StrategyRules).delete(sr.strategyRuleId);
      });

      const strategyRulesReqs = strategyRules.value.map((sr, i) => ({ strategy: editingStrategyId.value, rule: sr.ruleId, order: i }));
      const batch = pb.createBatch();
      strategyRulesReqs.forEach((req) => {
        batch.collection(Collections.StrategyRules).create(req);
      });
      await batch.send();
    } else {
      const stratCreateRes = await pb.collection(Collections.PricingStrategies).create(event.values);

      const strategyRulesReqs = strategyRules.value.map((sr, i) => ({ strategy: stratCreateRes.id, rule: sr.ruleId, order: i }));
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
  const strategyRules = await pb.collection(Collections.StrategyRules).getFullList({ filter: `strategy="${id}"`, sort: 'order' });

  strategyRules.forEach(async (sr) => {
    await runPricingRule(sr.rule);
  });
};

const runPricingRule = async (id: string) => {
  const rule = await pb.collection(Collections.PricingRules).getOne(id);

  let filtered = null;

  switch (rule.filter) {
    case PricingRulesFilterOptions.all:
      filtered = pricing.value;
      break;
    case PricingRulesFilterOptions.set:
      filtered = pricing.value.filter((p) => p['Set Name'] === rule.filterValue);
      break;
    case PricingRulesFilterOptions.market:
      filtered = filterByNumericCondition(pricing.value, 'TCG Market Price', rule.filterValue!);
      break;
    case PricingRulesFilterOptions.low:
      filtered = filterByNumericCondition(pricing.value, 'TCG Low Price', rule.filterValue!);
      break;
    case PricingRulesFilterOptions.quantity:
      filtered = filterByNumericCondition(pricing.value, 'Total Quantity', rule.filterValue!);
      break;
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
      product['TCG Marketplace Price'] = value.toFixed(2); // maybe want to add in logic here similar to how it was before
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

function filterByNumericCondition<T extends Record<string, string | number>>(items: T[], propertyKey: keyof T, filterString: string): T[] {
  const match = filterString.match(/(>=|<=|>|<|==|!=)\s*(\d+(\.\d+)?)/);
  if (!match) return [];

  const operator = match[1] as FilterOperator;
  const threshold = parseFloat(match[2]);

  return items.filter((item) => {
    const rawValue = item[propertyKey];
    const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);
    if (isNaN(numericValue)) return false;

    switch (operator) {
      case '>':
        return numericValue > threshold;
      case '<':
        return numericValue < threshold;
      case '>=':
        return numericValue >= threshold;
      case '<=':
        return numericValue <= threshold;
      case '==':
        return numericValue === threshold;
      default:
        return false;
    }
  });
}

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
  items.value[1].items = rules.map((r) => ({ isRule: true, label: `${r.pricing} for ${r.filter} ${r.filterValue}`, id: r.id }));
};

const refreshStrategies = async () => {
  const strategies = await pb.collection(Collections.PricingStrategies).getFullList();
  items.value[0].items = strategies.map((s) => ({ isStrategy: true, label: s.name, id: s.id }));
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(async () => {
  await refreshStrategies();
  await refreshRules();
});
</script>
