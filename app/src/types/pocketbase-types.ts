/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from 'pocketbase';
import type { RecordService } from 'pocketbase';

export enum Collections {
  Authorigins = '_authOrigins',
  Externalauths = '_externalAuths',
  Mfas = '_mfas',
  Otps = '_otps',
  Superusers = '_superusers',
  CollectionItems = 'collectionItems',
  CollectionStats = 'collectionStats',
  Collections = 'collections',
  Expenses = 'expenses',
  OrderItems = 'orderItems',
  Orders = 'orders',
  PricingRules = 'pricingRules',
  PricingStrategies = 'pricingStrategies',
  Products = 'products',
  Sets = 'sets',
  StorePreferences = 'storePreferences',
  Stores = 'stores',
  StrategyRules = 'strategyRules',
  Users = 'users'
}

// Alias types for improved usability
export type IsoDateString = string;
export type IsoAutoDateString = string & { readonly autodate: unique symbol };
export type RecordIdString = string;
export type FileNameString = string & { readonly filename: unique symbol };
export type HTMLString = string;

type ExpandType<T> = unknown extends T ? (T extends unknown ? { expand?: unknown } : { expand: T }) : { expand: T };

// System fields
export type BaseSystemFields<T = unknown> = {
  id: RecordIdString;
  collectionId: string;
  collectionName: Collections;
} & ExpandType<T>;

export type AuthSystemFields<T = unknown> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type AuthoriginsRecord = {
  collectionRef: string;
  created: IsoAutoDateString;
  fingerprint: string;
  id: string;
  recordRef: string;
  updated: IsoAutoDateString;
};

export type ExternalauthsRecord = {
  collectionRef: string;
  created: IsoAutoDateString;
  id: string;
  provider: string;
  providerId: string;
  recordRef: string;
  updated: IsoAutoDateString;
};

export type MfasRecord = {
  collectionRef: string;
  created: IsoAutoDateString;
  id: string;
  method: string;
  recordRef: string;
  updated: IsoAutoDateString;
};

export type OtpsRecord = {
  collectionRef: string;
  created: IsoAutoDateString;
  id: string;
  password: string;
  recordRef: string;
  sentTo?: string;
  updated: IsoAutoDateString;
};

export type SuperusersRecord = {
  created: IsoAutoDateString;
  email: string;
  emailVisibility?: boolean;
  id: string;
  password: string;
  tokenKey: string;
  updated: IsoAutoDateString;
  verified?: boolean;
};

export type CollectionItemsRecord = {
  collection?: RecordIdString;
  created: IsoAutoDateString;
  id: string;
  listed?: IsoDateString;
  marketPriceAtImport?: number;
  product: RecordIdString;
  qtyAcquired?: number;
  qtySold?: number;
  store: RecordIdString;
  unitCogs?: number;
  updated: IsoAutoDateString;
};

export type CollectionStatsRecord<
  TtotalMarketValue = unknown,
  TtotalMarketValueAtImport = unknown,
  TtotalQtyAcquired = unknown,
  TtotalQtySold = unknown,
  TtotalSoldValue = unknown
> = {
  id: string;
  name?: string;
  purchaseCost?: number;
  purchased?: IsoDateString;
  purchasedFrom?: string;
  store?: RecordIdString;
  totalMarketValue?: null | TtotalMarketValue;
  totalMarketValueAtImport?: null | TtotalMarketValueAtImport;
  totalQtyAcquired?: null | TtotalQtyAcquired;
  totalQtySold?: null | TtotalQtySold;
  totalSoldValue?: null | TtotalSoldValue;
};

export type CollectionsRecord = {
  created: IsoAutoDateString;
  id: string;
  name?: string;
  purchaseCost?: number;
  purchased?: IsoDateString;
  purchasedFrom?: string;
  store?: RecordIdString;
  updated: IsoAutoDateString;
};

export enum ExpensesTypeOptions {
  'cards' = 'cards',
  'supplies' = 'supplies',
  'other' = 'other'
}
export type ExpensesRecord = {
  created: IsoAutoDateString;
  id: string;
  name?: string;
  price?: number;
  purchaseDate?: IsoDateString;
  quantity?: number;
  store?: RecordIdString;
  type?: ExpensesTypeOptions;
  updated: IsoAutoDateString;
  url?: string;
};

export type OrderItemsRecord = {
  created: IsoAutoDateString;
  id: string;
  order?: RecordIdString;
  product?: RecordIdString;
  quantity?: number;
  store?: RecordIdString;
  updated: IsoAutoDateString;
};

export type OrdersRecord = {
  address: string;
  addressTwo?: string;
  carrier?: string;
  city: string;
  cogs?: number;
  country: string;
  created: IsoAutoDateString;
  feePercentage?: number;
  firstName: string;
  id: string;
  isTracking?: boolean;
  itemCount: number;
  lastName: string;
  orderDate: IsoDateString;
  packageOunces?: number;
  postalCode: string;
  processingFee?: number;
  productValue: number;
  productWeight: number;
  profit?: number;
  shippingCost?: number;
  shippingFee?: number;
  shippingMethod: string;
  state: string;
  store?: RecordIdString;
  totalPrice?: number;
  trackingNumber?: string;
  updated: IsoAutoDateString;
  vendorFee?: number;
};

export enum PricingRulesFilterOptions {
  'all' = 'all',
  'set' = 'set',
  'quantity' = 'quantity',
  'market' = 'market',
  'low' = 'low',
  'our' = 'our'
}

export enum PricingRulesFilterTypeOptions {
  'equals' = 'equals',
  'does not equal' = 'does not equal',
  'contains' = 'contains',
  'does not contain' = 'does not contain',
  'begins with' = 'begins with',
  'ends with' = 'ends with',
  'greater than' = 'greater than',
  'greater than or equal' = 'greater than or equal',
  'less than' = 'less than',
  'less than or equal' = 'less than or equal'
}
export type PricingRulesRecord = {
  created: IsoAutoDateString;
  filter?: PricingRulesFilterOptions;
  filterType?: PricingRulesFilterTypeOptions;
  filterValue?: string;
  id: string;
  pricing: string;
  store?: RecordIdString;
  updated: IsoAutoDateString;
};

export type PricingStrategiesRecord = {
  created: IsoAutoDateString;
  id: string;
  lastUsed?: IsoDateString;
  name?: string;
  store?: RecordIdString;
  updated: IsoAutoDateString;
};

export type ProductsRecord = {
  condition?: string;
  created: IsoAutoDateString;
  id: string;
  language?: string;
  marketPrice?: number;
  marketPriceUpdated?: IsoDateString;
  name?: string;
  number?: string;
  ourPrice?: number;
  productLine?: string;
  rarity?: string;
  scryfallId?: string;
  set?: string;
  store?: RecordIdString;
  tcgPlayerId: number;
  updated: IsoAutoDateString;
};

export type SetsRecord = {
  code?: string;
  created: IsoAutoDateString;
  id: string;
  tcgplayer: string;
  updated: IsoAutoDateString;
};

export type StorePreferencesRecord = {
  created: IsoAutoDateString;
  id: string;
  moreOunceCost?: number;
  oneOunceCards?: number;
  oneOunceCost?: number;
  store?: RecordIdString;
  threeOunceCards?: number;
  threeOunceCost?: number;
  trackingCost?: number;
  trackingThreshold?: number;
  twoOunceCards?: number;
  twoOunceCost?: number;
  updated: IsoAutoDateString;
};

export type StoresRecord = {
  created: IsoAutoDateString;
  id: string;
  name?: string;
  updated: IsoAutoDateString;
};

export type StrategyRulesRecord = {
  created: IsoAutoDateString;
  id: string;
  order?: number;
  rule?: RecordIdString;
  store?: RecordIdString;
  strategy?: RecordIdString;
  updated: IsoAutoDateString;
};

export type UsersRecord = {
  created: IsoAutoDateString;
  email: string;
  emailVisibility?: boolean;
  id: string;
  name?: string;
  password: string;
  store?: RecordIdString;
  tokenKey: string;
  updated: IsoAutoDateString;
  verified?: boolean;
};

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>;
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>;
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>;
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>;
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>;
export type CollectionItemsResponse<Texpand = unknown> = Required<CollectionItemsRecord> & BaseSystemFields<Texpand>;
export type CollectionStatsResponse<
  TtotalMarketValue = unknown,
  TtotalMarketValueAtImport = unknown,
  TtotalQtyAcquired = unknown,
  TtotalQtySold = unknown,
  TtotalSoldValue = unknown,
  Texpand = unknown
> = Required<CollectionStatsRecord<TtotalMarketValue, TtotalMarketValueAtImport, TtotalQtyAcquired, TtotalQtySold, TtotalSoldValue>> &
  BaseSystemFields<Texpand>;
export type CollectionsResponse<Texpand = unknown> = Required<CollectionsRecord> & BaseSystemFields<Texpand>;
export type ExpensesResponse<Texpand = unknown> = Required<ExpensesRecord> & BaseSystemFields<Texpand>;
export type OrderItemsResponse<Texpand = unknown> = Required<OrderItemsRecord> & BaseSystemFields<Texpand>;
export type OrdersResponse<Texpand = unknown> = Required<OrdersRecord> & BaseSystemFields<Texpand>;
export type PricingRulesResponse<Texpand = unknown> = Required<PricingRulesRecord> & BaseSystemFields<Texpand>;
export type PricingStrategiesResponse<Texpand = unknown> = Required<PricingStrategiesRecord> & BaseSystemFields<Texpand>;
export type ProductsResponse<Texpand = unknown> = Required<ProductsRecord> & BaseSystemFields<Texpand>;
export type SetsResponse<Texpand = unknown> = Required<SetsRecord> & BaseSystemFields<Texpand>;
export type StorePreferencesResponse<Texpand = unknown> = Required<StorePreferencesRecord> & BaseSystemFields<Texpand>;
export type StoresResponse<Texpand = unknown> = Required<StoresRecord> & BaseSystemFields<Texpand>;
export type StrategyRulesResponse<Texpand = unknown> = Required<StrategyRulesRecord> & BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  _authOrigins: AuthoriginsRecord;
  _externalAuths: ExternalauthsRecord;
  _mfas: MfasRecord;
  _otps: OtpsRecord;
  _superusers: SuperusersRecord;
  collectionItems: CollectionItemsRecord;
  collectionStats: CollectionStatsRecord;
  collections: CollectionsRecord;
  expenses: ExpensesRecord;
  orderItems: OrderItemsRecord;
  orders: OrdersRecord;
  pricingRules: PricingRulesRecord;
  pricingStrategies: PricingStrategiesRecord;
  products: ProductsRecord;
  sets: SetsRecord;
  storePreferences: StorePreferencesRecord;
  stores: StoresRecord;
  strategyRules: StrategyRulesRecord;
  users: UsersRecord;
};

export type CollectionResponses = {
  _authOrigins: AuthoriginsResponse;
  _externalAuths: ExternalauthsResponse;
  _mfas: MfasResponse;
  _otps: OtpsResponse;
  _superusers: SuperusersResponse;
  collectionItems: CollectionItemsResponse;
  collectionStats: CollectionStatsResponse;
  collections: CollectionsResponse;
  expenses: ExpensesResponse;
  orderItems: OrderItemsResponse;
  orders: OrdersResponse;
  pricingRules: PricingRulesResponse;
  pricingStrategies: PricingStrategiesResponse;
  products: ProductsResponse;
  sets: SetsResponse;
  storePreferences: StorePreferencesResponse;
  stores: StoresResponse;
  strategyRules: StrategyRulesResponse;
  users: UsersResponse;
};

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<
  {
    // Omit AutoDate fields
    [K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: // Convert FileNameString to File
    T[K] extends infer U ? (U extends FileNameString | FileNameString[] ? (U extends any[] ? File[] : File) : U) : never;
  },
  'id'
>;

// Create type for Auth collections
export type CreateAuth<T> = {
  id?: RecordIdString;
  email: string;
  emailVisibility?: boolean;
  password: string;
  passwordConfirm: string;
  verified?: boolean;
} & ProcessCreateAndUpdateFields<T>;

// Create type for Base collections
export type CreateBase<T> = {
  id?: RecordIdString;
} & ProcessCreateAndUpdateFields<T>;

// Update type for Auth collections
export type UpdateAuth<T> = Partial<Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>> & {
  email?: string;
  emailVisibility?: boolean;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
  verified?: boolean;
};

// Update type for Base collections
export type UpdateBase<T> = Partial<Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>>;

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> = CollectionResponses[T] extends AuthSystemFields
  ? CreateAuth<CollectionRecords[T]>
  : CreateBase<CollectionRecords[T]>;

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> = CollectionResponses[T] extends AuthSystemFields
  ? UpdateAuth<CollectionRecords[T]>
  : UpdateBase<CollectionRecords[T]>;

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
  collection<T extends keyof CollectionResponses>(idOrName: T): RecordService<CollectionResponses[T]>;
} & PocketBase;
