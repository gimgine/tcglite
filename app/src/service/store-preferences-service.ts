import { Collections, type StorePreferencesRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';

export class StorePreferencesService {
  getAll = async () => {
    return await pb.collection(Collections.StorePreferences).getFullList();
  };

  batchUpdate = async (preferences: Partial<StorePreferencesRecord>[]) => {
    const batch = pb.createBatch();

    preferences.forEach((p) => {
      batch.collection(Collections.StorePreferences).update(p.id!, p);
    });

    await batch.send();
  };

  batchCreate = async (preferences: Partial<StorePreferencesRecord>[]) => {
    const batch = pb.createBatch();

    preferences.forEach((p) => {
      batch.collection(Collections.StorePreferences).create(p);
    });

    await batch.send();
  };
}
