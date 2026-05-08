import { FormProvider, type UseFormReturn } from 'react-hook-form';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { ProductBarcodeField } from '@/components/product-barcode-field';
import { BottomSheetWrapper } from '@/components/app-bottom-sheet';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useVariantSheet } from '../../../context/variant-sheet-context';
import type { VariantFormValues } from '../../../form/types';
import { VariantTypeOptionFields } from '../../variant-type-option-fields';
import { VariantPricingInventoryFields } from '../../variant-pricing-inventory-fields';
import { VariantSubmitButton } from './submit-button';

type VariantEditorSheetProps = {
  selectedVariantTypeIds: string[];
  variantForm: UseFormReturn<VariantFormValues>;
  isSavingVariant: boolean;
  isSubmitDisabled?: boolean;
  isCreatingVariantOption: boolean;
  onSubmitVariant: () => void;
  onCreateVariantOption: (
    value: string,
    variantTypeId: string,
    onSelect: (id: string) => void
  ) => Promise<void>;
};

export function VariantEditorSheet({
  selectedVariantTypeIds,
  variantForm,
  isSavingVariant,
  isSubmitDisabled = false,
  isCreatingVariantOption,
  onSubmitVariant,
  onCreateVariantOption,
}: VariantEditorSheetProps) {
  const { sheetRef, selectedVariant } = useVariantSheet();
  const isEdit = Boolean(selectedVariant);

  return (
    <BottomSheetWrapper ref={sheetRef} snapPoints={['20%', '50%']}>
      <BottomSheetView className="bg-app-surface">
        <FormProvider {...variantForm}>
          <VStack space="xl" className="px-5 pb-8 pt-2">
            <Text className="text-xl font-bold text-typography-900">
              {isEdit ? 'Edit Variant' : 'Add Variant'}
            </Text>

            <VStack space="4xl" className="w-full">
              <ProductBarcodeField
                value={variantForm.watch('barcode')}
                onChangeText={(value) => variantForm.setValue('barcode', value)}
                onPressScan={() => {}}
              />

              <VariantTypeOptionFields
                selectedVariantTypeIds={selectedVariantTypeIds}
                isCreatingVariantOption={isCreatingVariantOption}
                onCreateVariantOption={onCreateVariantOption}
              />

              <VariantPricingInventoryFields />
            </VStack>

            <VariantSubmitButton
              isEdit={isEdit}
              isSaving={isSavingVariant}
              isDisabled={isSubmitDisabled}
              onPress={onSubmitVariant}
            />
          </VStack>
        </FormProvider>
      </BottomSheetView>
    </BottomSheetWrapper>
  );
}
