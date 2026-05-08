import { useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { useBarcode } from '@/screens/barcode/hooks/use-barcode';
import type { ProductEditorScreenProps } from './form/types';
import { VARIANT_INVALID_MESSAGE } from './form/variant-validation';
import { ProductEditorHeader } from './components/product-editor-header';
import { ProductMediaSection } from './components/product-media-section';
import { ProductBasicInfoSection } from './components/product-basic-info-section';
import { ProductCategorySection } from './components/product-category-section';
import { ProductPricingSection } from './components/product-pricing-section';
import { ProductVariantConfigSection } from './components/product-variant-config-section';
import { VariantToggle } from './components/variant-toggle';
import { VariantEditorSheet } from './components/sheets/variant-editor-sheet';
import { ImagePickerSheet } from './components/sheets/image-picker-sheet';
import { CatalogLookupsProvider } from './context/catalog-lookups-context';
import { VariantSheetProvider } from './context/variant-sheet-context';
import { MediaPickerProvider, useMediaPicker } from './context/media-picker-context';
import { useInlineCreators } from './hooks/use-inline-creators';
import { useInvalidVariants } from './hooks/use-invalid-variants';
import { useProductForm } from './hooks/use-product-form';
import { useProductMutations } from './hooks/use-product-mutations';
import { useVariantForm } from './hooks/use-variant-form';
import { useVariantMutations } from './hooks/use-variant-mutations';
import { KeyboardAvoidingView, Platform } from 'react-native';

export function ProductEditorScreen(props: ProductEditorScreenProps) {
  return (
    <CatalogLookupsProvider
      categories={props.categories ?? []}
      variantTypes={props.variantTypes ?? []}
      variantOptions={props.variantOptions ?? []}
    >
      <VariantSheetProvider isProductSaved={Boolean(props.product?.id)}>
        <MediaPickerProvider
          initialMedia={props.media ?? null}
          productId={props.product?.id ?? null}
          tenantId={props.product?.tenant ?? null}
        >
          <ProductEditorBody {...props} />
        </MediaPickerProvider>
      </VariantSheetProvider>
    </CatalogLookupsProvider>
  );
}

function ProductEditorBody({
  screenTitle,
  product,
  variants = [],
}: ProductEditorScreenProps) {
  const router = useRouter();
  const { openBarcodeScanner } = useBarcode();
  const { isMediaDirty } = useMediaPicker();

  const {
    productForm,
    variantsEnabled,
    selectedVariantTypeIds,
    title,
    isProductDirty,
  } = useProductForm(product);

  const { variantForm, isVariantDirty } = useVariantForm({ selectedVariantTypeIds });

  const headerTitle = useMemo(() => title ?? screenTitle, [title, screenTitle]);

  const { invalidVariantMap, invalidVariantCount } = useInvalidVariants({
    variants,
    selectedVariantTypeIds,
    variantsEnabled,
  });

  const { onSubmitProduct, isSavingProduct } = useProductMutations({
    product,
    productForm,
    invalidVariantCount,
  });

  const { onSubmitVariant, removeVariant, isSavingVariant } = useVariantMutations({
    product,
    variants,
    selectedVariantTypeIds,
    variantForm,
  });

  const {
    createCategoryInline,
    removeCategorySelection,
    createVariantOptionInline,
    isCreatingVariantOption,
  } = useInlineCreators({ tenantId: product?.tenant ?? null });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
    <FormProvider {...productForm}>
      <SafeAreaView className="flex-1 bg-app-page" edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="grow px-5 pb-14 pt-4"
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
        >
          <ProductEditorHeader
            headerTitle={headerTitle}
            isSavingProduct={isSavingProduct}
            isSaveDisabled={!isProductDirty && !isMediaDirty}
            onBack={() => router.back()}
            onSave={onSubmitProduct}
          />

          <ProductMediaSection />

          <VStack space="4xl" className="w-full">
            <ProductBasicInfoSection />
            <ProductCategorySection
              onCreateCategory={createCategoryInline}
              onDeleteCategory={removeCategorySelection}
            />
            <VariantToggle />

            {!variantsEnabled ? (
              <ProductPricingSection onPressScan={openBarcodeScanner} />
            ) : (
              <ProductVariantConfigSection
                variants={variants}
                invalidVariantMap={invalidVariantMap}
                invalidVariantCount={invalidVariantCount}
                invalidVariantMessage={VARIANT_INVALID_MESSAGE}
                onRemoveVariant={removeVariant}
              />
            )}
          </VStack>
        </ScrollView>

        <ImagePickerSheet />

        <VariantEditorSheet
          selectedVariantTypeIds={selectedVariantTypeIds}
          variantForm={variantForm}
          isSavingVariant={isSavingVariant}
          isSubmitDisabled={!isVariantDirty}
          isCreatingVariantOption={isCreatingVariantOption}
          onSubmitVariant={onSubmitVariant}
          onCreateVariantOption={createVariantOptionInline}
        />
      </SafeAreaView>
    </FormProvider>
    </KeyboardAvoidingView>
  );
}
