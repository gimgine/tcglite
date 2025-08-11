import { Collections } from '@/types/pocketbase-types';
import { parsePricingCsv, type PricingCsv } from './csv-parse';
import pb from './pocketbase';
import axios from 'axios';
import { useToast, type ToastServiceMethods } from 'primevue';

export const formatCurrency = (value?: number) => {
  return value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const syncSetsTable = async (fromPricingCsv: boolean) => {
  try {
    // Fetch unique TCGplayer set names
    let uniqueSetNames: string[] = [];

    if (fromPricingCsv) {
      const response = await fetch('/TCGplayer__MyPricing_20250708_092458.csv');
      const blob = await response.blob();
      const file = new File([blob], 'Pricing.csv', { type: blob.type });
      const pricing: PricingCsv[] = await parsePricingCsv(file);

      uniqueSetNames = Array.from(
        new Set(
          pricing
            .filter((p) => p['Product Line'] === 'Magic')
            .map((p) => p['Set Name'])
            .filter(Boolean)
        )
      );
    } else {
      const cardsRes = await pb.collection(Collections.Cards).getFullList();
      uniqueSetNames = Array.from(new Set(cardsRes.map((c) => c.set).filter(Boolean)));
    }

    // Load existing Sets table and Scryfall data
    const setsRes = await pb.collection(Collections.Sets).getFullList();
    const scryfallRes = await axios.get<{ data: Array<{ code: string; name: string }> }>('https://api.scryfall.com/sets');

    const existingTcgplayerNames = new Set(setsRes.map((s) => s.tcgplayer.toLowerCase()));
    const scryfallNameToCode = new Map(scryfallRes.data.data.map((set) => [set.name.toLowerCase(), set.code]));

    for (const tcgName of uniqueSetNames) {
      const normalized = tcgName.toLowerCase();

      if (existingTcgplayerNames.has(normalized)) continue;

      const matchingCode = scryfallNameToCode.get(normalized) || '';

      await pb.collection(Collections.Sets).create({
        code: matchingCode,
        tcgplayer: tcgName
      });
    }

    console.log(`Sets table synced from ${fromPricingCsv ? 'PricingCsv' : 'Cards'}`);
  } catch (error) {
    console.error('Error syncing Sets table:', error);
  }
};

export const copyToClipboard = async (value: string, toast: ToastServiceMethods, label?: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.add({ severity: 'success', summary: 'Copied', detail: `Copied ${label ?? 'text'} to clipboard.`, life: 3000 });
  } catch (err) {
    console.error('Failed to copy:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: `Failed to copy ${label ?? 'text'} to clipboard.`, life: 3000 });
  }
};
