import { useCallback, type ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { ProductComposerScreen } from '@/screens/products/product-composer-screen';
import { useCreateProductMutation, useEditProductMutation } from '@/hooks/use-products-mutations';
import { useMediaMutation } from '@/hooks/use-media-mutation';
import { ProductFormProvider } from '@/screens/products/product-form-context';
import { buildProductFormInitialFromProduct } from '@/hooks/form-payload';
import type { Product } from '@/payload/types';

type CreateProductScreenProps = {
  product?: Product;
};

export function CreateProductScreen({ product }: CreateProductScreenProps) {
  const createProductMutation = useCreateProductMutation();
  const editProductMutation = useEditProductMutation();
  const mediaMutation = useMediaMutation();
  const router = useRouter();
  const isEdit = Boolean(product?.id);
  const onSave = useCallback(async ({ product: productValues, files }: Parameters<ComponentProps<typeof ProductComposerScreen>['onSubmit']>[0]) => {
    const media = await mediaMutation.mutateAsync({
      file: files[0],
      altSeed: productValues.title ?? '',
      existingMedia: productValues.media,
    });
    const payload = {
      ...productValues,
      ...(media ? { media } : {}),
    };
    const apiProduct = payload as Partial<Product>;
    if (isEdit && product?.id) {
      await editProductMutation.mutateAsync({
        id: product.id,
        product: apiProduct,
      });
    } else {
      await createProductMutation.mutateAsync({ product: apiProduct });
    }
    router.back();
  }, [createProductMutation, editProductMutation, isEdit, mediaMutation, product?.id, router]);

  const initial = product ? buildProductFormInitialFromProduct(product) : undefined;

  return (
    <ProductFormProvider initial={initial}>
      <ProductComposerScreen
        mode={isEdit ? 'edit' : 'create'}
        screenTitle={isEdit ? product?.title ?? 'Edit Product' : 'Create Product'}
        isSubmitting={
          (isEdit ? editProductMutation.isPending : createProductMutation.isPending) ||
          mediaMutation.isPending
        }
        onSubmit={onSave}
      />
    </ProductFormProvider>
  );
}
