import { useMemo } from 'react';
import type ProductVariant from '@/database/model/ProductVariant';
import { useCatalogLookups } from '../context/catalog-lookups-context';
import { isVariantInvalidForSelectedTypes } from '../form/variant-validation';

type UseInvalidVariantsParams = {
  variants: ProductVariant[];
  selectedVariantTypeIds: string[];
  variantsEnabled: boolean;
};

export function useInvalidVariants({
  variants,
  selectedVariantTypeIds,
  variantsEnabled,
}: UseInvalidVariantsParams) {
  const { optionTypeById } = useCatalogLookups();

  const invalidVariantMap = useMemo<Record<string, boolean>>(() => {
    if (!variantsEnabled) return {};
    return variants.reduce<Record<string, boolean>>((acc, variant) => {
      acc[variant.id] = isVariantInvalidForSelectedTypes({
        variant,
        selectedVariantTypeIds,
        optionTypeById,
      });
      return acc;
    }, {});
  }, [optionTypeById, selectedVariantTypeIds, variants, variantsEnabled]);

  const invalidVariantCount = useMemo(
    () => Object.values(invalidVariantMap).filter(Boolean).length,
    [invalidVariantMap]
  );

  return { invalidVariantMap, invalidVariantCount };
}
