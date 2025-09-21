import { Collections, type StorePreferencesRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';

export class StorePreferencesService {
  get = async () => {
    return (await pb.collection(Collections.StorePreferences).getFullList())[0];
  };

  create = async (preferences: Omit<StorePreferencesRecord, 'id'>) => {
    await pb.collection(Collections.StorePreferences).create(preferences);
  };

  update = async (preferences: StorePreferencesRecord) => {
    await pb.collection(Collections.StorePreferences).update(preferences.id, preferences);
  };
}
