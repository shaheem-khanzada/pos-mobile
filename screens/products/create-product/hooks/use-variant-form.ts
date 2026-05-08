import { useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useCatalogLookups } from '../context/catalog-lookups-context';
import { useVariantSheet } from '../context/variant-sheet-context';
import { buildVariantOptionsByType, defaultsFromVariant } from '../form/defaults';
import type { VariantFormValues } from '../form/types';

type UseVariantFormParams = {
  selectedVariantTypeIds: string[];
};

type UseVariantFormResult = {
  variantForm: UseFormReturn<VariantFormValues>;
  isVariantDirty: boolean;
};

export function useVariantForm({
  selectedVariantTypeIds,
}: UseVariantFormParams): UseVariantFormResult {
  const { variantOptions } = useCatalogLookups();
  const { selectedVariant } = useVariantSheet();

  const variantForm = useForm<VariantFormValues>({
    defaultValues: {
      ...defaultsFromVariant(null),
      optionsByType: {},
    },
    mode: 'onChange',
  });

  useEffect(() => {
    variantForm.reset({
      ...defaultsFromVariant(selectedVariant),
      optionsByType: buildVariantOptionsByType({
        variant: selectedVariant,
        selectedVariantTypeIds,
        variantOptions,
      }),
    });
  }, [selectedVariant, selectedVariantTypeIds, variantForm, variantOptions]);

  return {
    variantForm,
    isVariantDirty: variantForm.formState.isDirty,
  };
}
