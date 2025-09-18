import { Collections } from '@/types/pocketbase-types';
import pb from '@/util/pocketbase';

export class UserService {
  getByName = async (name: string) => {
    return await pb.collection(Collections.Users).getFirstListItem(`name = "${name}"`);
  };

  getForStore = async (storeId: string) => {
    return await pb.collection(Collections.Users).getFullList({ filter: `store = "${storeId}"` });
  };

  update = async (id: string, values: { [key: string]: unknown }) => {
    await pb.collection(Collections.Users).update(id, values);
  };
}
