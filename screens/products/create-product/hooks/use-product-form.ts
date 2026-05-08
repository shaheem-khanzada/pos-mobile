import { useEffect } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import type Product from '@/database/model/Product';
import { useBarcode } from '@/screens/barcode/hooks/use-barcode';
import { defaultsFromProduct } from '../form/defaults';
import type { ProductFormValues } from '../form/types';

type UseProductFormResult = {
  productForm: UseFormReturn<ProductFormValues>;
  variantsEnabled: boolean;
  selectedVariantTypeIds: string[];
  title: string;
  isProductDirty: boolean;
};

export function useProductForm(product?: Product | null): UseProductFormResult {
  const productForm = useForm<ProductFormValues>({
    defaultValues: defaultsFromProduct(product),
    mode: 'onChange',
  });

  const variantsEnabled = useWatch({ control: productForm.control, name: 'enableVariants' });
  const selectedVariantTypeIds =
    useWatch({ control: productForm.control, name: 'variantTypes' }) ?? [];
  const title = useWatch({ control: productForm.control, name: 'title' });

  useEffect(() => {
    productForm.reset(defaultsFromProduct(product));
  }, [product?.id, productForm]);

  const { scannedBarcode, clearScannedBarcode } = useBarcode();
  useEffect(() => {
    if (!scannedBarcode) return;
    productForm.setValue('barcode', scannedBarcode);
    clearScannedBarcode();
  }, [clearScannedBarcode, productForm, scannedBarcode]);

  return {
    productForm,
    variantsEnabled,
    selectedVariantTypeIds,
    title,
    isProductDirty: productForm.formState.isDirty,
  };
}
