import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBarcode } from '@/screens/barcode/hooks/use-barcode';
import { ArrowLeft, Sun } from 'lucide-react-native';
import { ProductBarcodeField } from '@/components/product-barcode-field';
import { Select, type SelectItem } from '@/components/select';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import {
  useCreateVariantOptionMutation,
  useDeleteVariantOptionMutation,
  useVariantOptionsQuery,
} from '@/hooks/use-variant-option-mutation';
import { useVariantTypesQuery } from '@/hooks/use-variant-types-query';
import { useCreateVariantMutation, useEditVariantMutation } from '@/hooks/use-variants-mutation';
import { relationIds } from '@/hooks/form-payload';
import type { Variant } from '@/payload/types';
import {
  fieldLabelClass,
  inputTextClass,
  standardInputClass,
  variationCardSurfaceClass,
} from '@/theme/ui';

export function CreateVariantScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    productId?: string;
    variantId?: string;
    productName?: string;
    variant?: string;
  }>();
  const variantTypesQuery = useVariantTypesQuery();
  const variantOptionsQuery = useVariantOptionsQuery();
  const createOptionMutation = useCreateVariantOptionMutation();
  const deleteOptionMutation = useDeleteVariantOptionMutation();
  const createVariantMutation = useCreateVariantMutation();
  const editVariantMutation = useEditVariantMutation();
  const [barcode, setBarcode] = useState('');
  const { scannedBarcode, clearScannedBarcode, openBarcodeScanner } = useBarcode();
  const [inventory, setInventory] = useState('');
  const [pricePkr, setPricePkr] = useState('');
  const options: SelectItem[] = (variantOptionsQuery.data?.docs ?? []).map((o) => ({
    id: o.id,
    label: o.label,
  }));
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const selectedOptionTitle = useMemo(
    () => options.find((o) => o.id === selectedOptionId)?.label ?? '',
    [options, selectedOptionId]
  );
  const autoTitle = useMemo(() => {
    const productName = (params.productName ?? '').trim();
    if (!productName) return selectedOptionTitle ? `- ${selectedOptionTitle}` : '';
    return selectedOptionTitle ? `${productName} - ${selectedOptionTitle}` : productName;
  }, [params.productName, selectedOptionTitle]);

  const isEditMode = Boolean(params.variantId);

  useEffect(() => {
    const raw = params.variant;
    if (!raw || typeof raw !== 'string') return;
    try {
      const v = JSON.parse(raw) as Variant;
      setBarcode((v.barcode ?? '').trim());
      setInventory(v.inventory == null ? '' : String(v.inventory));
      setPricePkr(v.priceInPKR == null ? '' : String(v.priceInPKR));
      const optId = relationIds(v.options)[0];
      setSelectedOptionId(optId ?? null);
    } catch {
      // ignore invalid payload
    }
  }, [params.variant, params.variantId]);

  useEffect(() => {
    if (!scannedBarcode) return;
    setBarcode(scannedBarcode);
    clearScannedBarcode();
  }, [clearScannedBarcode, scannedBarcode]);

  const addOption = useCallback((name: string) => {
    const label = name.trim();
    if (!label) return;
    const firstType = variantTypesQuery.data?.[0];
    if (!firstType) return;
    void createOptionMutation
      .mutateAsync({
        variantType: firstType.id,
        label,
        value: label.toLowerCase().replace(/\s+/g, '-'),
      })
      .then((doc) => setSelectedOptionId(doc.id));
  }, [createOptionMutation, variantTypesQuery.data]);

  const deleteOptionSelection = useCallback((id: string) => {
    void deleteOptionMutation.mutateAsync(id);
    setSelectedOptionId((prev) => (prev === id ? null : prev));
  }, [deleteOptionMutation]);

  const onSaveVariant = useCallback(async () => {
    if (!params.productId) return;
    const payload = {
      barcode: barcode.trim() || null,
      inventory: inventory.trim() === '' ? null : Math.trunc(Number(inventory)),
      priceInPKR: pricePkr.trim() === '' ? null : Number(pricePkr),
      product: params.productId,
      options: selectedOptionId ? [selectedOptionId] : [],
    };
    if (params.variantId) {
      await editVariantMutation.mutateAsync({ id: params.variantId, data: payload });
    } else {
      await createVariantMutation.mutateAsync(payload);
    }
    router.back();
  }, [
    barcode,
    createVariantMutation,
    editVariantMutation,
    inventory,
    params.productId,
    params.variantId,
    pricePkr,
    router,
    selectedOptionId,
  ]);

  return (
    <SafeAreaView
      className="flex-1 bg-app-page"
      edges={['top', 'left', 'right', 'bottom']}
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
          >
            <Icon as={ArrowLeft} size="lg" className="text-typography-900" />
          </Pressable>
          <Text className="text-xl font-bold text-typography-900">
            {isEditMode ? 'Edit Variant' : 'Create Variant'}
          </Text>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80">
            <Icon as={Sun} className="text-emerald-500" size="md" />
          </Pressable>
        </HStack>

        <VStack space="4xl" className="w-full">
          <VStack space="sm" className="w-full shrink-0">
            <Text className={cn(fieldLabelClass, 'ml-0.5')}>Variant title</Text>
            <Input size="lg" variant="outline" className={standardInputClass}>
              <InputField
                className={cn(inputTextClass, 'px-0 placeholder:text-typography-400')}
                placeholder="Auto generated from product + option"
                value={autoTitle}
                editable={false}
              />
            </Input>
          </VStack>

          <ProductBarcodeField
            value={barcode}
            onChangeText={setBarcode}
            onPressScan={openBarcodeScanner}
          />

          <Select.Provider
            items={options}
            title="Select option *"
            selectedId={selectedOptionId}
            onSelect={setSelectedOptionId}
            onDelete={deleteOptionSelection}
            onCreate={addOption}
            actionTitle="+ New option"
          >
            <Select.Frame>
              <Select.Header />
              <Select.AddRow />
              <Select.List />
            </Select.Frame>
          </Select.Provider>

          <VStack space="sm" className="w-full shrink-0">
            <Text className={cn(fieldLabelClass, 'ml-0.5')}>Inventory</Text>
            <Input size="lg" variant="outline" className={standardInputClass}>
              <InputField
                className={cn(inputTextClass, 'px-0 placeholder:text-typography-400')}
                placeholder="0"
                keyboardType="number-pad"
                value={inventory}
                onChangeText={setInventory}
              />
            </Input>
          </VStack>

          <VStack space="sm" className="w-full shrink-0">
            <Text className={cn(fieldLabelClass, 'ml-0.5')}>Price (PKR)</Text>
            <Input size="lg" variant="outline" className={standardInputClass}>
              <InputField
                className={cn(inputTextClass, 'px-0 placeholder:text-typography-400')}
                placeholder="Rs. 0"
                keyboardType="decimal-pad"
                value={pricePkr}
                onChangeText={setPricePkr}
              />
            </Input>
          </VStack>
        </VStack>

        <Pressable
          onPress={onSaveVariant}
          disabled={createVariantMutation.isPending || editVariantMutation.isPending || !params.productId}
          className={cn(
            'mt-14 h-14 w-full items-center justify-center active:opacity-90',
            variationCardSurfaceClass
          )}
        >
          <Text className={fieldLabelClass}>
            {createVariantMutation.isPending || editVariantMutation.isPending
              ? 'Saving...'
              : isEditMode
                ? 'Save changes'
                : 'Add variant'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
