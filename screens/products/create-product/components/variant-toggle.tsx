import { Controller, useFormContext } from 'react-hook-form';
import { HStack } from '@/components/ui/hstack';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { fieldLabelClass } from '@/theme/ui';
import type { ProductFormValues } from '../form/types';

export function VariantToggle() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <HStack className="w-full items-center justify-between">
      <Text className={fieldLabelClass}>Enable variations</Text>
      <Controller
        control={control}
        name="enableVariants"
        render={({ field: { value, onChange } }) => (
          <Switch
            value={value}
            onValueChange={onChange}
            size="md"
            trackColor={{ false: 'rgb(228, 228, 231)', true: 'rgb(16, 185, 129)' }}
            thumbColor="rgb(255, 255, 255)"
            ios_backgroundColor="rgb(228, 228, 231)"
          />
        )}
      />
    </HStack>
  );
}
