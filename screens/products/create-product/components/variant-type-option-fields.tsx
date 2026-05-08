import { Controller, useFormContext, type FieldError } from 'react-hook-form';
import { Select } from '@/components/select';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import type { VariantFormValues } from '../form/types';
import { useCatalogLookups } from '../context/catalog-lookups-context';

type VariantTypeOptionFieldsProps = {
  selectedVariantTypeIds: string[];
  isCreatingVariantOption: boolean;
  onCreateVariantOption: (
    value: string,
    variantTypeId: string,
    onSelect: (id: string) => void
  ) => Promise<void>;
};

export function VariantTypeOptionFields({
  selectedVariantTypeIds,
  isCreatingVariantOption,
  onCreateVariantOption,
}: VariantTypeOptionFieldsProps) {
  const { variantTypeLabelById, variantTypeOptionsMap } = useCatalogLookups();
  const {
    control,
    formState: { errors },
  } = useFormContext<VariantFormValues>();

  const optionsByTypeErrors = errors.optionsByType as
    | Record<string, FieldError | undefined>
    | undefined;

  return (
    <>
      {selectedVariantTypeIds.map((variantTypeId) => {
        const typeLabel = variantTypeLabelById[variantTypeId] ?? 'Variant option';
        const optionsForType = variantTypeOptionsMap[variantTypeId] ?? [];
        const fieldError = optionsByTypeErrors?.[variantTypeId];

        return (
          <Controller
            key={variantTypeId}
            control={control}
            name={`optionsByType.${variantTypeId}` as const}
            rules={{ required: 'Please select one variant option.' }}
            render={({ field: { onChange, value } }) => (
              <FormControl isInvalid={Boolean(fieldError?.message)}>
                <Select.Provider
                  mode="single"
                  items={optionsForType}
                  title={`${typeLabel} *`}
                  selectedId={value}
                  onSelect={onChange}
                  onCreate={(newOptionLabel) =>
                    void onCreateVariantOption(newOptionLabel, variantTypeId, onChange)
                  }
                  actionTitle={isCreatingVariantOption ? 'Saving...' : '+ New option'}
                >
                  <Select.Frame>
                    <Select.Header />
                    <Select.AddRow />
                    <Select.List />
                  </Select.Frame>
                </Select.Provider>
                {fieldError?.message ? (
                  <FormControlError>
                    <FormControlErrorText>{fieldError.message}</FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>
            )}
          />
        );
      })}
    </>
  );
}
