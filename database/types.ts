export interface Tenant {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

export type SyncState = 'synced' | 'created' | 'updated' | 'deleted';

export interface User {
  id: string;
  role: 'super-admin' | 'user';
  tenants: Tenant[];
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  collection: 'users';
}

export interface Media {
  id: string;
  alt: string;
  url: string;
  tenant?: string | Tenant;
}

export interface Category {
  id: string;
  title: string;
  tenant?: string | Tenant;
}

export interface VariantType {
  id: string;
  label: string;
  name: string;
  tenant?: string | Tenant;
}

export interface VariantOption {
  id: string;
  label: string;
  value: string;
  variantType?: string | VariantType;
  tenant?: string | Tenant;
}

export type Variant = {
  id: string;
  barcode?: string | null;
  title?: string | null;
  inventory?: number | null;
  priceInPKR?: number | null;
  costInPKREnabled?: boolean | null;
  costInPKR?: number | null;
  priceInPKREnabled?: boolean | null;
  options?: VariantOption[] | string[];
  tenant?: string | Tenant;
};

export interface Product {
  id: string;
  title: string;
  barcode?: string | null;
  description?: string | null;
  categories: Category[];
  media: Media;
  tenant?: string | Tenant;
  inventory?: number | null;
  enableVariants?: boolean | null;
  variantTypes?: string[];
  variants?: Variant[];
  priceInPKREnabled?: boolean;
  priceInPKR?: number;
  costInPKREnabled?: boolean | null;
  costInPKR?: number | null;
  slug?: string | null;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string | null;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: Variant;
  unitPriceInPKR?: number | null;
  unitCostInPKR?: number | null;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  purchasedAt?: string | null;
  subtotal?: number | null;
  /** Order-level discount in PKR (subtotal − discount = amount charged). */
  discount?: number | null;
  currency?: 'PKR' | null;
  tenant?: string | Tenant;
  cogsTotal?: number | null;
  grossProfit?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  paymentMethod: 'cash' | 'online' | 'card';
  status?: ('active' | 'purchased' | 'abandoned') | null;
  updatedAt: string;
  createdAt: string;
  deletedAt?: string | null;
}
