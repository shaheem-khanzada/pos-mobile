import type Product from '@/database/model/Product';
import type ProductVariant from '@/database/model/ProductVariant';
import type { VariantOption } from '@/database/model';
import type { ProductFormValues, VariantFormValues } from './types';

export function defaultsFromProduct(product: Product | null | undefined): ProductFormValues {
  if (!product) {
    return {
      title: '',
      description: '',
      barcode: '',
      priceInPKR: '',
      costInPKR: '',
      inventory: '',
      enableVariants: false,
      variantTypes: [],
      categories: [],
    };
  }
  return {
    title: product.title ?? '',
    description: product.description ?? '',
    barcode: product.barcode ?? '',
    priceInPKR: product.priceInPKR != null ? String(product.priceInPKR) : '',
    costInPKR: product.costInPKR != null ? String(product.costInPKR) : '',
    inventory: product.inventory != null ? String(product.inventory) : '',
    enableVariants: product.enableVariants === true,
    variantTypes: product.variantTypes ?? [],
    categories: product.categories ?? [],
  };
}

export function defaultsFromVariant(
  variant: ProductVariant | null | undefined
): Omit<VariantFormValues, 'optionsByType'> {
  return {
    title: variant?.title ?? '',
    barcode: variant?.barcode ?? '',
    inventory: variant?.inventory != null ? String(variant.inventory) : '',
    priceInPKR: variant?.priceInPKR != null ? String(variant.priceInPKR) : '',
    costInPKR: variant?.costInPKR != null ? String(variant.costInPKR) : '',
  };
}

export function buildVariantOptionsByType(params: {
  variant: ProductVariant | null | undefined;
  selectedVariantTypeIds: string[];
  variantOptions: VariantOption[];
}) {
  const { variant, selectedVariantTypeIds, variantOptions } = params;
  const variantOptionIds = new Set(variant?.options ?? []);
  const output: Record<string, string | null> = {};

  for (const variantTypeId of selectedVariantTypeIds) {
    const selectedOption = variantOptions.find(
      (option) => option.variantTypeId === variantTypeId && variantOptionIds.has(option.id)
    );
    output[variantTypeId] = selectedOption?.id ?? null;
  }

  return output;
}

