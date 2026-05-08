import { useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import type { TextInput } from 'react-native-gesture-handler';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { BottomSheetTextInput } from '@/components/ui/bottomsheet';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { fieldLabelClass, inputTextClass, standardInputClass } from '@/theme/ui';
import type { VariantFormValues } from '../form/types';

export function VariantPricingInventoryFields() {
  const {
    control,
    formState: { errors },
  } = useFormContext<VariantFormValues>();

  const priceRef = useRef<TextInput | null>(null);
  const costRef = useRef<TextInput | null>(null);

  const focusPrice = useCallback(() => {
    priceRef.current?.focus();
  }, []);

  const focusCost = useCallback(() => {
    costRef.current?.focus();
  }, []);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <>
      <VStack space="sm" className="w-full shrink-0">
        <Controller
          control={control}
          name="inventory"
          rules={{
            required: 'Inventory is required.',
            pattern: { value: /^\d+$/, message: 'Inventory must be a whole number.' },
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <FormControl isInvalid={Boolean(errors.inventory?.message)}>
              <Text className={cn(fieldLabelClass, 'ml-0.5')}>Inventory</Text>
              <BottomSheetTextInput
                ref={ref}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                submitBehavior="submit"
                returnKeyType="next"
                onSubmitEditing={focusPrice}
                className={cn(standardInputClass, inputTextClass, 'placeholder:text-typography-400')}
                placeholder="0"
                keyboardType="number-pad"
              />
              {errors.inventory?.message ? (
                <FormControlError>
                  <FormControlErrorText>{errors.inventory.message}</FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>
          )}
        />
      </VStack>

      <VStack space="sm" className="w-full shrink-0">
        <Controller
          control={control}
          name="priceInPKR"
          rules={{
            required: 'Price is required.',
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: 'Price must be a valid number (up to 2 decimals).',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={Boolean(errors.priceInPKR?.message)}>
              <Text className={cn(fieldLabelClass, 'ml-0.5')}>Price (PKR)</Text>
              <BottomSheetTextInput
                ref={priceRef}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                submitBehavior="submit"
                returnKeyType="next"
                onSubmitEditing={focusCost}
                className={cn(standardInputClass, inputTextClass, 'placeholder:text-typography-400')}
                placeholder="Rs. 0"
                keyboardType="decimal-pad"
              />
              {errors.priceInPKR?.message ? (
                <FormControlError>
                  <FormControlErrorText>{errors.priceInPKR.message}</FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>
          )}
        />
      </VStack>

      <VStack space="sm" className="w-full shrink-0">
        <Controller
          control={control}
          name="costInPKR"
          rules={{
            pattern: {
              value: /^$|^\d+(\.\d{1,2})?$/,
              message: 'Cost must be a valid number (up to 2 decimals).',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={Boolean(errors.costInPKR?.message)}>
              <Text className={cn(fieldLabelClass, 'ml-0.5')}>Cost (PKR)</Text>
              <BottomSheetTextInput
                ref={costRef}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                submitBehavior="blurAndSubmit"
                returnKeyType="done"
                onSubmitEditing={dismissKeyboard}
                className={cn(standardInputClass, inputTextClass, 'placeholder:text-typography-400')}
                placeholder="Rs. 0"
                keyboardType="decimal-pad"
              />
              {errors.costInPKR?.message ? (
                <FormControlError>
                  <FormControlErrorText>{errors.costInPKR.message}</FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>
          )}
        />
      </VStack>
    </>
  );
}
