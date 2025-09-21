import { StorePreferencesService } from '@/service/store-preferences-service';
import type { StorePreferencesRecord } from '@/types/pocketbase-types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePreferencesStore = defineStore('preferencesStore', () => {
  const service = new StorePreferencesService();

  // required may be bad here but you can't define a number property to be required and also able to be 0 in PocketBase
  const preferences = ref<Required<StorePreferencesRecord>>();

  const refresh = async () => {
    preferences.value = await service.get();
  };

  return {
    preferences,
    refresh
  };
});
