import type { TypedPocketBase } from '@/types/pocketbase-types';
import PocketBase from 'pocketbase';

const url = import.meta.env.DEV ? 'http://localhost:8090' : 'https://gimgine-tcg.pockethost.io/';

const pb = new PocketBase(url) as TypedPocketBase;

export default pb;
