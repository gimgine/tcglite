<template>
  <div class="flex flex-col justify-between">
    <span class="my-4 text-xl">Pull Sheet</span>

    <div class="grid max-h-[38rem] grid-cols-12 gap-8 overflow-y-auto">
      <div v-for="setGroup in groupedBySet" :key="setGroup.set" class="col-span-6">
        <div class="mb-2 border-b border-gray-300 text-sm text-gray-600">
          <span>{{ setGroup.set }}</span>
          <span class="float-right">{{ ` (${setGroup.pulls.length})` }}</span>
        </div>
        <ul>
          <li v-for="pull in setGroup.pulls" :key="pull['Product Name']" class="mb-1">
            <span v-if="pull.Condition.includes('Foil')" class="bg-foil mr-1 rounded-md px-2 text-white drop-shadow">F</span>
            <b>{{ `${pull.Quantity} ` }}</b>
            <span class="italic">{{ `${abbrCondition(pull.Condition as Condition)} ` }}</span>
            <span>{{ `${pull['Product Name']} #${pull.Number}` }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="flex w-full flex-col items-end">
      <Button severity="secondary" label="Next" icon="pi pi-arrow-right" icon-pos="right" @click="$emit('next')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PullSheetCsv } from '@/util/csv-parse';
import { Button } from 'primevue';
import { computed } from 'vue';

type Condition = 'Near Mint' | 'Lightly Played' | 'Moderately Played' | 'Heavily Played';

const props = defineProps<{ pullSheet: PullSheetCsv[] }>();
defineEmits<{ next: [] }>();

const groupedBySet = computed(() => {
  const groups: Record<string, PullSheetCsv[]> = {};

  for (const record of props.pullSheet) {
    if (!groups[record.Set]) {
      groups[record.Set] = [];
    }
    groups[record.Set].push(record);
  }

  return Object.entries(groups)
    .sort(([setA], [setB]) => setA.localeCompare(setB))
    .map(([set, pulls]) => ({
      set,
      pulls: pulls.slice().sort((a, b) => {
        const aNum = parseInt(a.Number, 10);
        const bNum = parseInt(b.Number, 10);

        if (isNaN(aNum) || isNaN(bNum)) {
          return a.Number.localeCompare(b.Number);
        }

        return aNum - bNum;
      })
    }));
});

const abbrCondition = (condition: Condition) => {
  const abbreviations: Record<Condition, string> = {
    'Near Mint': 'NM',
    'Lightly Played': 'LP',
    'Moderately Played': 'MP',
    'Heavily Played': 'HP'
  };

  for (const key of Object.keys(abbreviations)) {
    if (condition.includes(key)) {
      return abbreviations[key as Condition];
    }
  }
};
</script>
