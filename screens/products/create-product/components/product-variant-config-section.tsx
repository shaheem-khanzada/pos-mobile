import { Controller, useFormContext } from 'react-hook-form';
import type ProductVariant from '@/database/model/ProductVariant';
import { Select } from '@/components/select';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { fieldLabelClass, sectionActionLinkClass } from '@/theme/ui';
import { VariantItem } from './variant-item';
import type { ProductFormValues } from '../form/types';
import { useCatalogLookups } from '../context/catalog-lookups-context';
import { useVariantSheet } from '../context/variant-sheet-context';

type ProductVariantConfigSectionProps = {
  variants: ProductVariant[];
  invalidVariantMap: Record<string, boolean>;
  invalidVariantMessage: string;
  invalidVariantCount: number;
  onRemoveVariant: (variant: ProductVariant) => void;
};

export function ProductVariantConfigSection({
  variants,
  invalidVariantMap,
  invalidVariantMessage,
  invalidVariantCount,
  onRemoveVariant,
}: ProductVariantConfigSectionProps) {
  const { variantTypeItems } = useCatalogLookups();
  const { openForCreate, openForEdit, isAddDisabled } = useVariantSheet();
  const { control } = useFormContext<ProductFormValues>();

  return (
    <VStack space="lg" className="w-full">
      <Controller
        control={control}
        name="variantTypes"
        render={({ field: { value, onChange } }) => (
          <Select.Provider
            mode="multiple"
            items={variantTypeItems}
            title="Variant Types *"
            selectedIds={value}
            onSelectionChange={onChange}
          >
            <Select.Frame>
              <Select.Header />
              <Select.AddRow />
              <Select.List />
            </Select.Frame>
          </Select.Provider>
        )}
      />

      <VStack space="lg" className="w-full">
        {invalidVariantCount > 0 ? (
          <Text className="text-xs font-bold text-error-600 dark:text-error-400">
            {invalidVariantCount} variant{invalidVariantCount > 1 ? 's are' : ' is'} invalid for selected types.
          </Text>
        ) : null}
        <HStack className="w-full items-center justify-between">
          <Text className={cn(fieldLabelClass, 'ml-0.5')}>Added variations</Text>
          <Pressable
            onPress={openForCreate}
            disabled={isAddDisabled}
            className="active:opacity-80"
          >
            <Text
              className={cn(
                sectionActionLinkClass,
                isAddDisabled && 'text-secondary-400'
              )}
            >
              + New variant
            </Text>
          </Pressable>
        </HStack>

        <VStack space="lg" className="w-full">
          {variants.map((variant) => (
            <VariantItem
              key={variant.id}
              item={variant}
              onRemoveVariant={onRemoveVariant}
              onPressVariant={openForEdit}
              isInvalid={Boolean(invalidVariantMap[variant.id])}
              invalidMessage={invalidVariantMap[variant.id] ? invalidVariantMessage : undefined}
            />
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
}
