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
  Number: number;
  Set: string;
  Rarity: string;
  Quantity: number;
  'Main Photo URL': string;
  'Set Release Date': string;
  SkuId: number;
  'Order Quantity': number;
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
