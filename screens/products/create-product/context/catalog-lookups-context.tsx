import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { SelectItem } from '@/components/select';
import type { Category, VariantOption, VariantType } from '@/database/model';
import {
  buildCategoryOptions,
  buildOptionTypeById,
  buildVariantOptionLabelById,
  buildVariantTypeItems,
  buildVariantTypeLabelById,
  buildVariantTypeOptionsMap,
} from '../selectors/lookups';

type CatalogLookupsValue = {
  categories: Category[];
  variantTypes: VariantType[];
  variantOptions: VariantOption[];
  categoryOptions: SelectItem[];
  variantTypeItems: SelectItem[];
  variantTypeOptionsMap: Record<string, SelectItem[]>;
  variantTypeLabelById: Record<string, string>;
  variantOptionLabelById: Record<string, string>;
  optionTypeById: Record<string, string>;
};

const CatalogLookupsContext = createContext<CatalogLookupsValue | null>(null);

type CatalogLookupsProviderProps = {
  categories: Category[];
  variantTypes: VariantType[];
  variantOptions: VariantOption[];
  children: ReactNode;
};

export function CatalogLookupsProvider({
  categories,
  variantTypes,
  variantOptions,
  children,
}: CatalogLookupsProviderProps) {
  const value = useMemo<CatalogLookupsValue>(
    () => ({
      categories,
      variantTypes,
      variantOptions,
      categoryOptions: buildCategoryOptions(categories),
      variantTypeItems: buildVariantTypeItems(variantTypes),
      variantTypeLabelById: buildVariantTypeLabelById(variantTypes),
      variantTypeOptionsMap: buildVariantTypeOptionsMap(variantOptions),
      variantOptionLabelById: buildVariantOptionLabelById(variantOptions),
      optionTypeById: buildOptionTypeById(variantOptions),
    }),
    [categories, variantTypes, variantOptions]
  );

  return (
    <CatalogLookupsContext.Provider value={value}>{children}</CatalogLookupsContext.Provider>
  );
}

export function useCatalogLookups(): CatalogLookupsValue {
  const ctx = useContext(CatalogLookupsContext);
  if (!ctx) {
    throw new Error('useCatalogLookups must be used inside <CatalogLookupsProvider>');
  }
  return ctx;
}
