export interface OrderRequest {
  id: string;
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
  store: string;

  totalPrice?: number;
  vendorFee?: number;
  processingFee?: number;
  cogs?: number;
  shippingCost?: number;
  packageOunces?: number;
  isTracking?: boolean;
  profit?: number;
  feePercentage?: number;
}

export interface OrderItemRequest {
  order: string;
  product: string;
  store: string;
  quantity: number;
  tcgPlayerId: number;
}

export interface Result {
  success: boolean;
  message: string;
}
