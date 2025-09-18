import { Collections, type StoresRecord } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';

export class StoreService {
  getOne = async (id: string) => {
    return await pb.collection(Collections.Stores).getOne(id);
  };

  create = async (name: string) => {
    return await pb.collection(Collections.Stores).create({ name });
  };
}
