import type Media from '@/database/model/Media';
import type Product from '@/database/model/Product';
import type ProductVariant from '@/database/model/ProductVariant';
import type { Category, VariantOption, VariantType } from '@/database/model';

export type ProductFormValues = {
  title: string;
  description: string;
  barcode: string;
  priceInPKR: string;
  costInPKR: string;
  inventory: string;
  enableVariants: boolean;
  variantTypes: string[];
  categories: string[];
};

export type VariantFormValues = {
  title: string;
  barcode: string;
  inventory: string;
  priceInPKR: string;
  costInPKR: string;
  optionsByType: Record<string, string | null>;
};

export type ProductEditorScreenProps = {
  screenTitle: string;
  product?: Product | null;
  variants?: ProductVariant[];
  variantTypes?: VariantType[];
  variantOptions?: VariantOption[];
  categories?: Category[];
  media?: Media | null;
};
