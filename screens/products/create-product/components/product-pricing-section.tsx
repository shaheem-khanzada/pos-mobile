import { Controller, useFormContext } from 'react-hook-form';
import { ProductBarcodeField } from '@/components/product-barcode-field';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { fieldLabelClass, inputTextClass, standardInputClass } from '@/theme/ui';
import type { ProductFormValues } from '../form/types';

type ProductPricingSectionProps = {
  onPressScan: () => void;
};

export function ProductPricingSection({ onPressScan }: ProductPricingSectionProps) {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <>
      <Controller
        control={control}
        name="barcode"
        render={({ field: { value, onChange } }) => (
          <ProductBarcodeField value={value} onChangeText={onChange} onPressScan={onPressScan} />
        )}
      />

      <HStack space="md" className="w-full">
        <VStack space="sm" className="flex-1">
          <Text className={cn(fieldLabelClass, 'ml-0.5')}>Price (PKR)</Text>
          <Controller
            control={control}
            name="priceInPKR"
            render={({ field: { value, onChange } }) => (
              <Input size="lg" variant="outline" className={standardInputClass}>
                <InputField
                  className={cn(inputTextClass, 'px-0')}
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                />
              </Input>
            )}
          />
        </VStack>
        <VStack space="sm" className="flex-1">
          <Text className={cn(fieldLabelClass, 'ml-0.5')}>Inventory</Text>
          <Controller
            control={control}
            name="inventory"
            render={({ field: { value, onChange } }) => (
              <Input size="lg" variant="outline" className={standardInputClass}>
                <InputField
                  className={cn(inputTextClass, 'px-0')}
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                />
              </Input>
            )}
          />
        </VStack>
      </HStack>

      <VStack space="sm" className="w-full">
        <Text className={cn(fieldLabelClass, 'ml-0.5')}>Cost (PKR)</Text>
        <Controller
          control={control}
          name="costInPKR"
          render={({ field: { value, onChange } }) => (
            <Input size="lg" variant="outline" className={standardInputClass}>
              <InputField
                className={cn(inputTextClass, 'px-0')}
                keyboardType="decimal-pad"
                placeholder="Optional"
                value={value}
                onChangeText={onChange}
              />
            </Input>
          )}
        />
      </VStack>
    </>
  );
}
