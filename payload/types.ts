
export interface Tenant {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

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
  thumbnailURL: string;
}

export interface Category {
  id: string;
  title: string;
}

export interface VariantType {
  id: string;
  label: string;
  name: string;
}

export interface VariantOption {
  id: string;
  label: string;
  value: string;
}

export type Variant = {
  id: string;
  barcode?: string | null;
  title?: string | null;
  inventory?: number | null;
  priceInPKR?: number | null;
  options?: VariantOption[] | string[];
};

export interface Product {
  id: string;
  title: string;
  barcode?: string | null;
  description?: string | null;
  categories: Category[];
  media: Media;
  inventory?: number | null;
  enableVariants?: boolean | null;
  variantTypes?: string[];
  variants?: Variant[];
  priceInPKREnabled?: boolean;
  priceInPKR?: number;
  slug: string;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string | null;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: Variant;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  purchasedAt?: string | null;
  subtotal?: number | null;
  currency?: 'PKR' | null;
  customerName: string;
  customerPhone?: string | null;
  paymentMethod: 'cash' | 'online';
  status?: ('active' | 'purchased' | 'abandoned') | null;
  updatedAt: string;
  createdAt: string;
}
