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
  Cards = 'cards',
  Expenses = 'expenses',
  Orders = 'orders',
  PricingRules = 'pricingRules',
  PricingStrategies = 'pricingStrategies',
  Sets = 'sets',
  Stores = 'stores',
  StrategyRules = 'strategyRules',
  Users = 'users'
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
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
  created?: IsoDateString;
  fingerprint: string;
  id: string;
  recordRef: string;
  updated?: IsoDateString;
};

export type ExternalauthsRecord = {
  collectionRef: string;
  created?: IsoDateString;
  id: string;
  provider: string;
  providerId: string;
  recordRef: string;
  updated?: IsoDateString;
};

export type MfasRecord = {
  collectionRef: string;
  created?: IsoDateString;
  id: string;
  method: string;
  recordRef: string;
  updated?: IsoDateString;
};

export type OtpsRecord = {
  collectionRef: string;
  created?: IsoDateString;
  id: string;
  password: string;
  recordRef: string;
  sentTo?: string;
  updated?: IsoDateString;
};

export type SuperusersRecord = {
  created?: IsoDateString;
  email: string;
  emailVisibility?: boolean;
  id: string;
  password: string;
  tokenKey: string;
  updated?: IsoDateString;
  verified?: boolean;
};

export type CardsRecord = {
  condition?: string;
  created?: IsoDateString;
  id: string;
  name?: string;
  number?: string;
  order?: RecordIdString;
  quantity: number;
  rarity?: string;
  set?: string;
  store?: RecordIdString;
  updated?: IsoDateString;
};

export enum ExpensesTypeOptions {
  'cards' = 'cards',
  'supplies' = 'supplies',
  'other' = 'other'
}
export type ExpensesRecord = {
  created?: IsoDateString;
  id: string;
  name?: string;
  price?: number;
  purchaseDate?: IsoDateString;
  quantity?: number;
  store?: RecordIdString;
  type?: ExpensesTypeOptions;
  updated?: IsoDateString;
  url?: string;
};

export type OrdersRecord = {
  address: string;
  addressTwo?: string;
  carrier?: string;
  city: string;
  cogs?: number;
  country: string;
  created?: IsoDateString;
  feePercentage?: number;
  firstName: string;
  id: string;
  itemCount: number;
  lastName: string;
  orderDate: IsoDateString;
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
  updated?: IsoDateString;
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
  created?: IsoDateString;
  filter?: PricingRulesFilterOptions;
  filterType?: PricingRulesFilterTypeOptions;
  filterValue?: string;
  id: string;
  pricing: string;
  store?: RecordIdString;
  updated?: IsoDateString;
};

export type PricingStrategiesRecord = {
  created?: IsoDateString;
  id: string;
  lastUsed?: IsoDateString;
  name?: string;
  store?: RecordIdString;
  updated?: IsoDateString;
};

export type SetsRecord = {
  code?: string;
  created?: IsoDateString;
  id: string;
  tcgplayer: string;
  updated?: IsoDateString;
};

export type StoresRecord = {
  created?: IsoDateString;
  id: string;
  name?: string;
  updated?: IsoDateString;
};

export type StrategyRulesRecord = {
  created?: IsoDateString;
  id: string;
  order?: number;
  rule?: RecordIdString;
  store?: RecordIdString;
  strategy?: RecordIdString;
  updated?: IsoDateString;
};

export type UsersRecord = {
  created?: IsoDateString;
  email: string;
  emailVisibility?: boolean;
  id: string;
  name?: string;
  password: string;
  store?: RecordIdString;
  tokenKey: string;
  updated?: IsoDateString;
  verified?: boolean;
};

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>;
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>;
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>;
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>;
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>;
export type CardsResponse<Texpand = unknown> = Required<CardsRecord> & BaseSystemFields<Texpand>;
export type ExpensesResponse<Texpand = unknown> = Required<ExpensesRecord> & BaseSystemFields<Texpand>;
export type OrdersResponse<Texpand = unknown> = Required<OrdersRecord> & BaseSystemFields<Texpand>;
export type PricingRulesResponse<Texpand = unknown> = Required<PricingRulesRecord> & BaseSystemFields<Texpand>;
export type PricingStrategiesResponse<Texpand = unknown> = Required<PricingStrategiesRecord> & BaseSystemFields<Texpand>;
export type SetsResponse<Texpand = unknown> = Required<SetsRecord> & BaseSystemFields<Texpand>;
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
  cards: CardsRecord;
  expenses: ExpensesRecord;
  orders: OrdersRecord;
  pricingRules: PricingRulesRecord;
  pricingStrategies: PricingStrategiesRecord;
  sets: SetsRecord;
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
  cards: CardsResponse;
  expenses: ExpensesResponse;
  orders: OrdersResponse;
  pricingRules: PricingRulesResponse;
  pricingStrategies: PricingStrategiesResponse;
  sets: SetsResponse;
  stores: StoresResponse;
  strategyRules: StrategyRulesResponse;
  users: UsersResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>;
  collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>;
  collection(idOrName: '_mfas'): RecordService<MfasResponse>;
  collection(idOrName: '_otps'): RecordService<OtpsResponse>;
  collection(idOrName: '_superusers'): RecordService<SuperusersResponse>;
  collection(idOrName: 'cards'): RecordService<CardsResponse>;
  collection(idOrName: 'expenses'): RecordService<ExpensesResponse>;
  collection(idOrName: 'orders'): RecordService<OrdersResponse>;
  collection(idOrName: 'pricingRules'): RecordService<PricingRulesResponse>;
  collection(idOrName: 'pricingStrategies'): RecordService<PricingStrategiesResponse>;
  collection(idOrName: 'sets'): RecordService<SetsResponse>;
  collection(idOrName: 'stores'): RecordService<StoresResponse>;
  collection(idOrName: 'strategyRules'): RecordService<StrategyRulesResponse>;
  collection(idOrName: 'users'): RecordService<UsersResponse>;
};
