export interface OrderCsvRecord {
  orderNumber: string;
  firstName: string;
  lastName: string;
  address: string;
  addressTwo?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  orderDate: Date;
  productWeight: number;
  shippingMethod: string;
  itemCount: number;
  productValue: number;
  shippingFee: number;
  trackingNumber?: string;
  carrier?: string;

  totalPrice?: number;
  vendorFee?: number;
  processingFee?: number;
  cogs?: number;
  shippingCost?: number;
  profit?: number;
  feePercentage?: number;
}

export interface PullSheetCsvRecord {
  productLine: string;
  productName: string;
  condition: string;
  number: number;
  set: string;
  rarity: string;
  quantity: number;
  mainPhotoUrl: string;
  setReleaseDate: string;
}
