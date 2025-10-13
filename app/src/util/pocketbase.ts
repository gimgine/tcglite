import type { TypedPocketBase } from '@/types/pocketbase-types';
import PocketBase from 'pocketbase';

const url = import.meta.env.VITE_PB_URL;

const pb = new PocketBase(url) as TypedPocketBase;

export default pb;
