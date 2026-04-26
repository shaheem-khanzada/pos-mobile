import { useCallback, useEffect, useMemo } from 'react';
import { ArrowLeft, Camera, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useBarcode } from '@/screens/barcode/hooks/use-barcode';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Switch } from '@/components/ui/switch';
import { ProductBarcodeField } from '@/components/product-barcode-field';
import {
  BottomSheetTrigger,
  SelectProductImageSheet,
} from '@/components/select-product-image-sheet';
import { cn } from '@/lib/cn';
import {
  fieldLabelClass,
  fieldShellClass,
  inputTextClass,
  standardInputClass,
} from '@/theme/ui';
import {
  AddedVariationsSection,
} from './create-product/components/added-variations-section';
import { Select } from '@/components/select';
import type { UploadableFile } from '@/hooks/use-media-mutation';
import { useCategoriesQuery, useCreateCategoryMutation } from '@/hooks/use-category-mutation';
import { useVariantTypesQuery } from '@/hooks/use-variant-types-query';
import {
  type FormProduct,
  useProductFormContext,
} from '@/screens/products/product-form-context';
import { relationId, relationIds } from '@/hooks/form-payload';
import type { Variant } from '@/payload/types';


type ProductComposerScreenProps = {
  mode: 'create' | 'edit';
  screenTitle: string;
  isSubmitting?: boolean;
  onSubmit: (payload: {
    product: Partial<FormProduct>;
    variants?: Variant[];
    files: UploadableFile[];
  }) => Promise<void> | void;
};

export function ProductComposerScreen({
  mode,
  screenTitle,
  isSubmitting,
  onSubmit,
}: ProductComposerScreenProps) {
  const {
    product: formProduct,
    variants,
    selectedImage,
    imagePreviewUri,
    setProduct,
    setSelectedImage,
    setImagePreviewUri,
    clearImage,
    removeVariant,
  } = useProductFormContext();
  const categoriesQuery = useCategoriesQuery();
  const variantTypesQuery = useVariantTypesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const router = useRouter();
  const { scannedBarcode, clearScannedBarcode, openBarcodeScanner } = useBarcode();

  useEffect(() => {
    if (!scannedBarcode) return;
    setProduct({ barcode: scannedBarcode });
    clearScannedBarcode();
  }, [clearScannedBarcode, scannedBarcode, setProduct]);

  const categories = categoriesQuery.data ?? [];
  const variantTypeItems = (variantTypesQuery.data ?? []).map((t) => ({
    id: t.id,
    label: t.label,
  }));
  
  const selectedVariantTypeId =
    relationIds(formProduct.variantTypes)[0] ?? null;

  const onSave = useCallback(async () => {
    const categoryIds = relationIds(formProduct.categories);
    const variantTypeIds = relationIds(formProduct.variantTypes);
    const mediaId = relationId(formProduct.media);
    const { variants: _formVariants, ...formProductFields } = formProduct;
    const product: Partial<FormProduct> = {
      ...formProductFields,
      title: formProduct.title,
      categories: categoryIds,
      variantTypes: variantTypeIds,
      ...(mediaId ? { media: mediaId } : {}),
    };
    const normalizedVariants: Variant[] = variants.map((variant) => ({
      ...variant,
      options: relationIds(variant.options),
    }));
    await onSubmit({
      product,
      variants: normalizedVariants,
      files: selectedImage ? [selectedImage] : [],
    });
  }, [formProduct, onSubmit, selectedImage, variants]);

  const commitNewCategory = useCallback((name: string) => {
    const normalized = name.trim();
    if (!normalized) return;
    void createCategoryMutation.mutateAsync(normalized).then((doc) => {
      const ids = relationIds(formProduct.categories);
      if (ids.includes(doc.id)) return;
      setProduct({ categories: [...ids, doc.id] });
    });
  }, [createCategoryMutation, formProduct.categories, setProduct]);

  const deleteCategorySelection = useCallback((id: string) => {
    const ids = relationIds(formProduct.categories);
    setProduct({ categories: ids.filter((c) => c !== id) });
  }, [formProduct.categories, setProduct]);

  const headerTitle = useMemo(() => {
    const raw = (formProduct.title ?? '').trim();
    if (!raw) return screenTitle;
    return raw
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [formProduct.title, screenTitle]);

  return (
    <SafeAreaView
      className="flex-1 bg-app-page"
      edges={['top', 'left', 'right', 'bottom']}
    >
      <SelectProductImageSheet
        onImageSelected={(file) => {
          setSelectedImage(file);
          setImagePreviewUri(file.uri);
        }}
        onRecentMediaSelected={(media) => {
          setSelectedImage(null);
          setImagePreviewUri(media.url);
          setProduct({ media: media.id });
        }}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="grow px-5 pb-14 pt-4"
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
        >
          <HStack className="items-center justify-between pb-6">
            <Pressable
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon as={ArrowLeft} size="lg" className="text-typography-900" />
            </Pressable>
            <Text className="text-xl font-bold text-typography-900">
              {headerTitle}
            </Text>
            <Pressable
              onPress={() => void onSave()}
              className="h-11 min-w-[52px] items-center justify-center rounded-full bg-app-surface px-3 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Save product"
              disabled={Boolean(isSubmitting)}
            >
              <Text className="text-sm font-bold text-emerald-500">
                {isSubmitting ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </HStack>

          <Box className="relative mb-10 w-full">
            <BottomSheetTrigger
              className={cn(
                'min-h-[200px] w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-outline-100 bg-app-surface',
                (selectedImage || imagePreviewUri) && 'border-0'
              )}
            >
              {selectedImage || imagePreviewUri ? (
                <Image
                  source={{ uri: selectedImage?.uri ?? imagePreviewUri ?? '' }}
                  alt="Product"
                  className="h-[200px] w-full"
                  size="none"
                />
              ) : (
                <VStack space="md" className="items-center py-10">
                  <Box className="rounded-2xl bg-background-100 p-4">
                    <Icon
                      as={Camera}
                      size="xl"
                      className="text-secondary-400"
                    />
                  </Box>
                  <Text className={cn(fieldLabelClass, 'text-center')}>
                    Product media
                  </Text>
                </VStack>
              )}
            </BottomSheetTrigger>
            {selectedImage || imagePreviewUri ? (
              <Pressable
                onPress={clearImage}
                className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-background-800/90 active:opacity-90"
                accessibilityLabel="Remove image"
              >
                <Icon as={X} className="text-typography-0" size="sm" />
              </Pressable>
            ) : null}
          </Box>

          <VStack space="4xl" className="w-full">
            <VStack space="sm" className="w-full shrink-0">
              <Text className={cn(fieldLabelClass, 'ml-0.5')}>Title *</Text>
              <Input size="lg" variant="outline" className={standardInputClass}>
                <InputField
                  className={cn(inputTextClass, 'px-0')}
                  value={formProduct.title}
                  onChangeText={(value) => setProduct({ title: value })}
                />
              </Input>
            </VStack>

            <VStack space="sm" className="w-full shrink-0">
              <Text className={cn(fieldLabelClass, 'ml-0.5')}>Description</Text>
              <Textarea
                className={cn(
                  fieldShellClass,
                  'h-[88px] min-h-[88px] w-full shrink-0'
                )}
              >
                <TextareaInput
                  className={cn(inputTextClass, 'h-full border-0 bg-transparent py-2')}
                  value={formProduct.description ?? ''}
                  onChangeText={(value) => setProduct({ description: value })}
                  multiline
                  textAlignVertical="top"
                />
              </Textarea>
            </VStack>

            {mode === 'edit' && !formProduct.enableVariants ? (
              <ProductBarcodeField
                value={formProduct.barcode ?? ''}
                onChangeText={(value) => setProduct({ barcode: value })}
                onPressScan={openBarcodeScanner}
              />
            ) : null}

            <Select.Provider
              mode="multiple"
              items={categories}
              title="Categories *"
              selectedIds={relationIds(formProduct.categories)}
              onSelectionChange={(ids) => setProduct({ categories: ids })}
              onDelete={deleteCategorySelection}
              onCreate={commitNewCategory}
              actionTitle="+ New category"
            >
              <Select.Frame>
                <Select.Header />
                <Select.AddRow />
                <Select.List />
              </Select.Frame>
            </Select.Provider>

            {mode === 'edit' ? (
              <>
                <HStack className="w-full items-center justify-between">
                  <Text className={fieldLabelClass}>Enable variations</Text>
                  <Switch
                    value={Boolean(formProduct.enableVariants)}
                    onValueChange={(value) =>
                      setProduct({
                        enableVariants: value,
                        priceInPKREnabled: !value,
                      })
                    }
                    size="md"
                    trackColor={{
                      false: 'rgb(228, 228, 231)',
                      true: 'rgb(16, 185, 129)',
                    }}
                    thumbColor="rgb(255, 255, 255)"
                    ios_backgroundColor="rgb(228, 228, 231)"
                  />
                </HStack>

                {!formProduct.enableVariants ? (
                  <HStack space="md" className="w-full">
                    <VStack space="sm" className="flex-1">
                      <Text className={cn(fieldLabelClass, 'ml-0.5')}>Price (PKR)</Text>
                      <Input size="lg" variant="outline" className={standardInputClass}>
                        <InputField
                          className={cn(inputTextClass, 'px-0')}
                          keyboardType="decimal-pad"
                          value={formProduct.priceInPKR == null ? '' : String(formProduct.priceInPKR)}
                          onChangeText={(value) =>
                            setProduct({
                              priceInPKR:
                                value === '' ? undefined : Number(value),
                            })
                          }
                        />
                      </Input>
                    </VStack>
                    <VStack space="sm" className="flex-1">
                      <Text className={cn(fieldLabelClass, 'ml-0.5')}>Inventory</Text>
                      <Input size="lg" variant="outline" className={standardInputClass}>
                        <InputField
                          className={cn(inputTextClass, 'px-0')}
                          keyboardType="number-pad"
                          value={formProduct.inventory == null ? '' : String(formProduct.inventory)}
                          onChangeText={(value) =>
                            setProduct({
                              inventory:
                                value === ''
                                  ? undefined
                                  : Math.trunc(Number(value)),
                            })
                          }
                        />
                      </Input>
                    </VStack>
                  </HStack>
                ) : (
                  <VStack space="xl" className="w-full">
                    <Select.Provider
                      items={variantTypeItems}
                      title="Variant type *"
                      selectedId={selectedVariantTypeId}
                      onSelect={(id) =>
                        setProduct({ variantTypes: id ? [id] : [] })
                      }
                    >
                      <Select.Frame>
                        <Select.Header />
                        <Select.List />
                      </Select.Frame>
                    </Select.Provider>
                    <AddedVariationsSection
                      items={variants}
                      onPressNewVariant={() =>
                        router.push({
                          pathname: '/tabs/create-variant',
                          params: {
                            productId: String(formProduct.id ?? ''),
                            productName: String(formProduct.title ?? ''),
                          },
                        })
                      }
                      onPressVariant={(variantId) => {
                        const doc = variants.find((v) => v.id === variantId);
                        if (!doc || !formProduct.id) return;
                        router.push({
                          pathname: '/tabs/create-variant',
                          params: {
                            productId: String(formProduct.id),
                            productName: String(formProduct.title ?? ''),
                            variantId: doc.id,
                            variant: JSON.stringify(doc),
                          },
                        });
                      }}
                      onRemoveVariant={removeVariant}
                      canCreateNew
                    />
                  </VStack>
                )}
              </>
            ) : null}
          </VStack>
        </ScrollView>
      </SelectProductImageSheet>
    </SafeAreaView>
  );
}
