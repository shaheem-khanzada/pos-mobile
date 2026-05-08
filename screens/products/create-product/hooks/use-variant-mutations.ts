import { useCallback, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import {
  createLocalVariant,
  deleteLocalVariant,
  updateLocalVariant,
} from '@/database';
import type Product from '@/database/model/Product';
import type ProductVariant from '@/database/model/ProductVariant';
import { setToast } from '@/toast/store';
import { useCatalogLookups } from '../context/catalog-lookups-context';
import { useVariantSheet } from '../context/variant-sheet-context';
import { defaultsFromVariant } from '../form/defaults';
import type { VariantFormValues } from '../form/types';
import {
  findVariantSubmissionError,
  type VariantSubmissionError,
} from '../form/variant-validation';
import { buildVariantPayload } from '../form/variant-payload';

type UseVariantMutationsParams = {
  product?: Product | null;
  variants: ProductVariant[];
  selectedVariantTypeIds: string[];
  variantForm: UseFormReturn<VariantFormValues>;
};

export function useVariantMutations({
  product,
  variants,
  selectedVariantTypeIds,
  variantForm,
}: UseVariantMutationsParams) {
  const { variantOptionLabelById } = useCatalogLookups();
  const { selectedVariant, setSelectedVariant, close: closeVariantSheet } = useVariantSheet();
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  const applyValidationError = useCallback(
    (error: VariantSubmissionError) => {
      if (error.kind === 'missing-options') {
        for (const typeId of error.missingTypeIds) {
          variantForm.setError(`optionsByType.${typeId}` as const, {
            type: 'required',
            message: 'Please select one variant option.',
          });
        }
        return;
      }
      variantForm.setError(`optionsByType.${error.firstTypeId}` as const, {
        type: 'validate',
        message: 'This variant combination is already used by another variant.',
      });
    },
    [variantForm]
  );

  const onSubmitVariant = variantForm.handleSubmit(async (values) => {
    if (isSavingVariant) return;
    if (!product?.id) {
      setToast({
        variant: 'warning',
        title: 'Save product first',
        description: 'Create or save the product before adding variants.',
      });
      return;
    }

    if (
      selectedVariant?.id &&
      !variants.some((variant) => variant.id === selectedVariant.id)
    ) {
      setToast({
        variant: 'warning',
        title: 'Variant no longer exists',
        description: 'This variant was removed. Please add it again.',
      });
      setSelectedVariant(null);
      closeVariantSheet();
      return;
    }

    const optionIdsByType = values.optionsByType ?? {};
    const selectedOptionIds = selectedVariantTypeIds
      .map((typeId) => optionIdsByType[typeId])
      .filter((value): value is string => Boolean(value));

    const validationError = findVariantSubmissionError({
      selectedVariantTypeIds,
      optionIdsByType,
      selectedOptionIds,
      variants,
      selectedVariantId: selectedVariant?.id ?? null,
    });
    if (validationError) {
      applyValidationError(validationError);
      return;
    }
    variantForm.clearErrors('optionsByType');

    setIsSavingVariant(true);
    try {
      const selectedOptionLabels = selectedOptionIds
        .map((id) => variantOptionLabelById[id])
        .filter(Boolean);
      const payload = buildVariantPayload({
        values,
        product,
        selectedOptionIds,
        selectedOptionLabels,
      });

      closeVariantSheet();
      if (selectedVariant?.id) {
        await updateLocalVariant(selectedVariant.id, payload);
      } else {
        await createLocalVariant(payload);
      }
      setSelectedVariant(null);
      variantForm.reset({
        ...defaultsFromVariant(null),
        optionsByType: {},
      });
    } finally {
      setIsSavingVariant(false);
    }
  });

  const removeVariant = useCallback(async (variant: ProductVariant) => {
    await deleteLocalVariant(variant.id);
  }, []);

  return { onSubmitVariant, removeVariant, isSavingVariant };
}
