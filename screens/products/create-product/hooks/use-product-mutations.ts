import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import {
  createLocalProduct,
  syncProductsToApi,
  updateLocalProduct,
} from '@/database';
import type Product from '@/database/model/Product';
import { setToast } from '@/toast/store';
import { useMediaPicker } from '../context/media-picker-context';
import type { ProductFormValues } from '../form/types';
import { buildProductPayload } from '../form/product-payload';
import { getSelectedTenantId } from '@/screens/auth/stores/auth-store';

type UseProductMutationsParams = {
  product?: Product | null;
  productForm: UseFormReturn<ProductFormValues>;
  invalidVariantCount: number;
};

export function useProductMutations({
  product,
  productForm,
  invalidVariantCount,
}: UseProductMutationsParams) {
  const { effectiveMedia, resetDirty: resetMediaDirty } = useMediaPicker();
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const onSubmitProduct = productForm.handleSubmit(async (values) => {
    if (isSavingProduct) return;
    if (values.enableVariants && invalidVariantCount > 0) {
      setToast({
        variant: 'warning',
        title: 'Invalid variants',
        description: 'Fix highlighted variants before saving the product.',
      });
      return;
    }

    if (!effectiveMedia?.id) {
      setToast({
        variant: 'warning',
        title: 'Media is required',
        description: 'Please select a product image before saving.',
      });
      return;
    }

    setIsSavingProduct(true);
    try {
      const payload = buildProductPayload({
        values,
        mediaId: effectiveMedia.id,
        tenant: getSelectedTenantId(),
      });
      if (product) {
        await updateLocalProduct(product.id, payload);
      } else {
        await createLocalProduct(payload);
      }
      await syncProductsToApi();
      resetMediaDirty();
    } finally {
      setIsSavingProduct(false);
    }
  });

  return { onSubmitProduct, isSavingProduct };
}
