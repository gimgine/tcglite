import { StorePreferencesService } from '@/service/store-preferences-service';
import { StorePreferencesFieldOptions, type StorePreferencesRecord, type StorePreferencesResponse } from '@/types/pocketbase-types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePreferencesStore = defineStore('preferencesStore', () => {
  const service = new StorePreferencesService();

  const preferences = ref<Record<StorePreferencesFieldOptions, StorePreferencesRecord>>();

  const oneOunceCards = ref<number>(0);
  const oneOunceCost = ref<number>(0);
  const twoOunceCards = ref<number>(0);
  const twoOunceCost = ref<number>(0);
  const threeOunceCards = ref<number>(0);
  const threeOunceCost = ref<number>(0);
  const moreOunceCost = ref<number>(0);

  const trackingThreshold = ref<number>(0);
  const trackingCost = ref<number>(0);

  const refresh = async () => {
    const prefs = await service.getAll();

    preferences.value = prefs.reduce(
      (acc, p) => {
        acc[p.field] = p;
        return acc;
      },
      {} as Record<StorePreferencesFieldOptions, StorePreferencesRecord>
    );

    oneOunceCards.value = Number(getPreferenceValue(prefs, StorePreferencesFieldOptions.oneOunceCards));
    oneOunceCost.value = Number(getPreferenceValue(prefs, StorePreferencesFieldOptions.oneOunceCost));
    twoOunceCards.value = Number(getPreferenceValue(prefs, StorePreferencesFieldOptions.twoOunceCards));
    twoOunceCost.value = Number(getPreferenceValue(prefs, StorePreferencesFieldOptions.twoOunceCost));
    threeOunceCards.value = Number(getPreferenceValue(prefs, StorePreferencesFieldOptions.threeOunceCards));
    threeOunceCost.value = Number(getPreferenceValue(prefs, StorePreferencesFieldOptions.threeOunceCost));
    moreOunceCost.value = Number(getPreferenceValue(prefs, StorePreferencesFieldOptions.moreOunceCost));

    trackingThreshold.value = Number(getPreferenceValue(prefs, StorePreferencesFieldOptions.trackingThreshold));
    trackingCost.value = Number(getPreferenceValue(prefs, StorePreferencesFieldOptions.trackingCost));
  };

  const getPreferenceValue = (preferences: StorePreferencesRecord[], field: StorePreferencesFieldOptions) => {
    return preferences.find((p) => p.field === field)?.value;
  };

  return {
    preferences,
    refresh,
    oneOunceCards,
    oneOunceCost,
    twoOunceCards,
    twoOunceCost,
    threeOunceCards,
    threeOunceCost,
    moreOunceCost,
    trackingThreshold,
    trackingCost
  };
});
