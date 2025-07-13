import { Collections, type SetsRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useSetStore = defineStore('setStore', () => {
  const sets = ref<SetsRecord[]>([]);
  const setsMap = computed(() => new Map(sets.value.map((set) => [set.tcgplayer, set.code])));

  const refresh = async () => {
    sets.value = await pb.collection(Collections.Sets).getFullList();
  };

  return { sets, setsMap, refresh };
});
