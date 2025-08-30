<template>
  <div class="flex flex-col justify-between">
    <span class="my-4 text-xl">Pull Sheet</span>

    <div class="grid max-h-[55vh] grid-cols-12 gap-8 overflow-y-auto">
      <div v-if="hoveredImage" class="absolute top-4 right-4 z-10">
        <img :src="hoveredImage" alt="Card Image" class="w-64 rounded shadow-lg" />
      </div>
      <Message v-else-if="imageError" class="absolute top-4 right-4 z-10" severity="error">{{ imageErrorMessage }}</Message>
      <div v-for="setGroup in groupedBySet" :key="setGroup.set" class="col-span-6">
        <div
          :class="[
            'mb-2 border-b text-sm',
            !setStore.setsMap.get(setGroup.set) ? 'border-red-600 text-red-600' : 'text-muted-color dark:border-surface-700 border-gray-300'
          ]"
        >
          <span
            :class="[
              'mr-2 rounded-t px-1 py-0.5 text-xs font-bold text-white',
              !setStore.setsMap.get(setGroup.set) ? 'bg-red-500' : 'dark:bg-surface-700 bg-gray-400'
            ]"
          >
            {{ setStore.setsMap.get(setGroup.set)?.toUpperCase() ?? 'N/A' }}
          </span>
          <span>{{ setGroup.set }}</span>
          <span class="float-right">{{ ` (${setGroup.pulls.reduce((sum, v) => sum + v.Quantity, 0)})` }}</span>
        </div>
        <ul class="flex flex-col gap-2">
          <li
            v-for="pull in setGroup.pulls"
            :key="pull['Product Name']"
            :class="['flex items-center gap-2 transition-opacity hover:opacity-50', isImageLoading ? 'cursor-progress' : '']"
            @mouseenter="handleHover(pull)"
            @mouseleave="handleLeave"
          >
            <b>{{ `${pull.Quantity} ` }}</b>
            <Tag :severity="getConditionSeverity(pull.Condition as Condition)">{{ abbrCondition(pull.Condition as Condition) }}</Tag>
            <span v-if="pull.Condition.includes('Foil')" class="bg-foil mr-1 rounded-md px-2 text-white drop-shadow">F</span>
            <span>{{ pull['Product Name'] }}</span>
            <Chip :label="`#${pull.Number}`" class="ml-auto !px-4 !py-1" />
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-4 flex w-full justify-between">
      <Button severity="secondary" label="Back" icon="pi pi-arrow-left" icon-pos="left" @click="$emit('back')" />
      <Button severity="secondary" label="Next" icon="pi pi-arrow-right" icon-pos="right" @click="$emit('next')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSetStore } from '@/store/set-store';
import { type PullSheetCsv } from '@/util/csv-parse';
import axios from 'axios';
import { Button, Message, Tag, Chip, type TagProps } from 'primevue';
import { computed, onMounted, ref } from 'vue';
// Types ------------------------------------------------------------------------------
type Condition = 'Near Mint' | 'Lightly Played' | 'Moderately Played' | 'Heavily Played';

// Component Info (props/emits) -------------------------------------------------------
const props = defineProps<{ pullSheet: PullSheetCsv[] }>();
defineEmits<{ next: []; back: [] }>();

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

// Reactive Variables -----------------------------------------------------------------
const setStore = useSetStore();
const hoveredImage = ref<string | null>(null);
const imageError = ref(false);
const imageErrorMessage = ref('');
const isImageLoading = ref(false);

const groupedBySet = computed(() => {
  const groups: Record<string, PullSheetCsv[]> = {};

  for (const record of props.pullSheet) {
    if (!groups[record.Set]) {
      groups[record.Set] = [];
    }
    groups[record.Set].push(record);
  }

  return Object.entries(groups)
    .sort(([setA], [setB]) => (setStore.setsMap.get(setA) ?? 'ZZZZZ').localeCompare(setStore.setsMap.get(setB) ?? 'ZZZZZ'))
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

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
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

const getConditionSeverity = (condition: Condition): TagProps['severity'] => {
  switch (condition) {
    case 'Near Mint':
      return 'success';
    case 'Lightly Played':
      return 'info';
    case 'Moderately Played':
      return 'warn';
    case 'Heavily Played':
      return 'danger';
  }
};

const handleHover = (pull: PullSheetCsv) => {
  isImageLoading.value = true;
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }

  hoverTimeout = setTimeout(async () => {
    const setCode = setStore.setsMap.get(pull.Set);
    if (setCode === undefined || setCode === '') {
      imageError.value = true;
      imageErrorMessage.value = 'Set mapping not found. Does it exist?';
      return;
    }

    const number = pull.Number;

    try {
      const scryfallRes = await axios.get(`https://api.scryfall.com/cards/${setCode}/${number}`);

      if (scryfallRes.data.card_faces) {
        hoveredImage.value = scryfallRes.data.card_faces[0].image_uris.normal;
        return;
      }

      hoveredImage.value = scryfallRes.data.image_uris.normal;
    } catch (error) {
      console.error('Error loading Scryfall image:', error);
      imageError.value = true;
      imageErrorMessage.value = 'Image not found.';
    } finally {
      isImageLoading.value = false;
    }
  }, 500);
};

const handleLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  hoveredImage.value = null;
  imageError.value = false;
};

// Lifecycle Hooks --------------------------------------------------------------------
onMounted(() => {
  setStore.refresh();
});
</script>
