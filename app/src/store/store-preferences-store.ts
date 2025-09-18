import { StorePreferencesService } from '@/service/store-preferences-service';
import { Collections, type StorePreferencesFieldOptions, type StorePreferencesRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStorePreferencesStore = defineStore('storePreferencesStore', () => {
  const preferences = ref<Record<StorePreferencesFieldOptions, StorePreferencesRecord>>();
  const service = new StorePreferencesService();

  const refresh = async () => {
    preferences.value = (await service.getAll()).reduce(
      (acc, p) => {
        acc[p.field] = p;
        return acc;
      },
      {} as Record<StorePreferencesFieldOptions, StorePreferencesRecord>
    );
  };

  return { preferences, refresh };
});
