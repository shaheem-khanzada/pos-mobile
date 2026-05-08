import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { fieldLabelClass, inputTextClass, standardInputClass } from '@/theme/ui';
import type { ProductFormValues } from '../form/types';

export function ProductBasicInfoSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  return (
    <>
      <VStack space="sm" className="w-full shrink-0">
        <Text className={cn(fieldLabelClass, 'ml-0.5')}>Title *</Text>
        <Controller
          control={control}
          name="title"
          rules={{
            required: 'Title is required.',
            validate: (value) => value.trim().length > 0 || 'Title is required.',
          }}
          render={({ field: { value, onChange } }) => (
            <FormControl isInvalid={Boolean(errors.title?.message)}>
              <Input size="lg" variant="outline" className={standardInputClass}>
                <InputField className={cn(inputTextClass, 'px-0')} value={value} onChangeText={onChange} />
              </Input>
              {errors.title?.message ? (
                <FormControlError>
                  <FormControlErrorText>{errors.title.message}</FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>
          )}
        />
      </VStack>

      <VStack space="sm" className="w-full shrink-0">
        <Text className={cn(fieldLabelClass, 'ml-0.5')}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <Input size="lg" variant="outline" className={standardInputClass}>
              <InputField className={cn(inputTextClass, 'px-0')} value={value} onChangeText={onChange} />
            </Input>
          )}
        />
      </VStack>
    </>
  );
}
