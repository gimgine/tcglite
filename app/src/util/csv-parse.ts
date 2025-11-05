import type { ExpensesTypeOptions } from '@/types/pocketbase-types';
import Papa from 'papaparse';

export interface ShippingCsv {
  Address1: string;
  Address2?: string;
  Carrier: string;
  City: string;
  Country: string;
  FirstName: string;
  'Item Count': number;
  LastName: string;
  'Order #': string;
  'Order Date': string;
  PostalCode: string;
  'Product Weight': number;
  'Shipping Fee Paid': number;
  'Shipping Method': string;
  State: string;
  'Tracking #'?: string;
  'Value Of Products': number;
}

export const parseShippingCsv = async (file: File): Promise<ShippingCsv[]> => {
  return new Promise((resolve, reject) => {
    let aborted = false;
    Papa.parse(file, {
      preview: 1,
      complete: (results) => {
        const firstRow = results.data[0] as string[];
        if (firstRow.length !== 17) {
          aborted = true;
          return;
        }

        Papa.parse<ShippingCsv>(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: (header) => (header === 'PostalCode' ? false : true),
          complete(results) {
            resolve(results.data);
          }
        });
      }
    });
    if (aborted) {
      console.error('Unable to parse Shipping CSV. The header did not contain all required fields.');
      reject();
    }
  });
};

export interface PullSheetCsv {
  'Product Line': string;
  'Product Name': string;
  Condition: string;
  Number: string;
  Set: string;
  Rarity: string;
  Quantity: number;
  'Main Photo URL': string;
  'Set Release Date': string;
  SkuId: number;
  'Order Quantity': string;
}

export const parsePullSheetCsv = async (file: File): Promise<PullSheetCsv[]> => {
  return new Promise((resolve, reject) => {
    let aborted = false;
    Papa.parse(file, {
      preview: 1,
      complete: (results) => {
        const firstRow = results.data[0] as string[];
        if (firstRow.length !== 11) {
          aborted = true;
          return;
        }

        Papa.parse<PullSheetCsv>(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete(results) {
            const data = results.data.slice(0, -1); // last line is "orders contained in pull sheet"
            resolve(data);
          }
        });
      }
    });
    if (aborted) {
      console.error('Unable to parse Pull Sheet CSV. The header did not contain all required fields.');
      reject();
    }
  });
};

export interface ListPullSheetCsv {
  'Product Line': string;
  'Product Name': string;
  Condition: string;
  Number: string;
  Set: string;
  Rarity: string;
  Quantity: number;
  'Saved Price': string;
}

function detectTextEncoding(u8: Uint8Array): 'utf-8' | 'utf-16le' | 'utf-16be' {
  if (u8.length >= 2) {
    const b0 = u8[0],
      b1 = u8[1];
    if (b0 === 0xff && b1 === 0xfe) return 'utf-16le'; // BOM LE
    if (b0 === 0xfe && b1 === 0xff) return 'utf-16be'; // BOM BE
  }
  // Heuristic: lots of 0x00 suggests UTF-16 even without BOM
  const sample = u8.slice(0, Math.min(u8.length, 512));
  const nullCount = sample.filter((b) => b === 0x00).length;
  if (nullCount > sample.length * 0.2) return 'utf-16le'; // Excel default is LE
  return 'utf-8';
}

export const parseListPullSheetCsv = async (file: File): Promise<ListPullSheetCsv[]> => {
  const ab = await file.arrayBuffer();
  const u8 = new Uint8Array(ab);
  const enc = detectTextEncoding(u8);

  // Decode text using the detected encoding
  const decoder = new TextDecoder(enc);
  let text = decoder.decode(ab);

  // Remove BOM if present (TextDecoder usually handles it, but be safe)
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  // Strip stray NULLs that come from mismatched encoding
  if (text.includes('\u0000')) {
    console.warn('[CSV] Found NULs in decoded text; stripping.');
    text = text.replace(/\u0000/g, '');
  }

  // Normalize line endings (helps Papa w/ Windows files)
  text = text.replace(/\r\n/g, '\n');

  // Quick preview to validate header count
  const preview = Papa.parse<string[]>(text, { preview: 1 });
  const firstRow = (preview.data?.[0] ?? []) as string[];

  if (!firstRow || firstRow.length !== 8) {
    console.error('[CSV] Expected 8 columns in header, got:', firstRow?.length, firstRow);
    throw new Error('Unable to parse List Pull Sheet CSV. The header did not contain all required fields.');
  }

  // Parse full CSV
  const results = Papa.parse<ListPullSheetCsv>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  });

  if (results.errors?.length) {
    console.error('[CSV] Papa parse errors:', results.errors);
    // You can choose to throw or continue; throwing is safer:
    throw new Error('CSV parse error(s): ' + results.errors.map((e) => e.message).join('; '));
  }

  return results.data;
};

export interface PricingCsv {
  'TCGplayer Id': number;
  'Product Line': string;
  'Set Name': string;
  'Product Name': string;
  Title?: string;
  Number: string;
  Rarity: string;
  Condition: string;
  'TCG Market Price': number;
  'TCG Direct Low': number;
  'TCG Low Price With Shipping': number;
  'TCG Low Price': number;
  'Total Quantity': number;
  'Add to Quantity': number;
  'TCG Marketplace Price': number;
  'Photo URL'?: string;
}

export const parsePricingCsv = async (file: File): Promise<PricingCsv[]> => {
  return new Promise((resolve, reject) => {
    let aborted = false;
    Papa.parse(file, {
      preview: 1,
      complete: (results) => {
        const firstRow = results.data[0] as string[];
        if (firstRow.length !== 16 && firstRow.length !== 3) {
          aborted = true;
          return;
        }

        Papa.parse<PricingCsv>(file, {
          header: true,
          dynamicTyping: (header) => (header === 'Number' ? false : true),
          skipEmptyLines: true,
          complete(results) {
            resolve(results.data);
          }
        });
      }
    });
    if (aborted) {
      console.error('Unable to parse Pull Sheet CSV. The header did not contain all required fields.');
      reject();
    }
  });
};

export interface ExpensesCsv {
  name?: string;
  price?: number;
  purchaseDate?: string;
  quantity?: number;
  type?: ExpensesTypeOptions;
  url?: string;
}

export const parseExpensesCsv = async (file: File): Promise<ExpensesCsv[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      preview: 1,
      complete: (results) => {
        const firstRow = results.data[0] as string[];
        if (firstRow.length !== 6) {
          reject();
        }

        Papa.parse<ExpensesCsv>(file, {
          header: true,
          dynamicTyping: (header) => (header === 'Number' ? false : true),
          skipEmptyLines: true,
          complete(results) {
            resolve(results.data);
          }
        });
      },
      error: () => reject()
    });
  });
};
