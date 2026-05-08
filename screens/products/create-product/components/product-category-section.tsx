import { Controller, useFormContext } from 'react-hook-form';
import { Select } from '@/components/select';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import type { ProductFormValues } from '../form/types';
import { useCatalogLookups } from '../context/catalog-lookups-context';

type ProductCategorySectionProps = {
  onCreateCategory: (
    value: string,
    selectedIds: string[],
    onChange: (ids: string[]) => void
  ) => Promise<void>;
  onDeleteCategory: (selectedIds: string[], id: string) => string[];
};

export function ProductCategorySection({
  onCreateCategory,
  onDeleteCategory,
}: ProductCategorySectionProps) {
  const { categoryOptions } = useCatalogLookups();
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  return (
    <Controller
      control={control}
      name="categories"
      rules={{
        validate: (value) =>
          Array.isArray(value) && value.length > 0 ? true : 'Select at least one category.',
      }}
      render={({ field: { value, onChange } }) => (
        <FormControl isInvalid={Boolean(errors.categories?.message)}>
          <Select.Provider
            mode="multiple"
            items={categoryOptions}
            title="Categories *"
            selectedIds={value}
            onSelectionChange={onChange}
            onCreate={(newCategoryTitle) => void onCreateCategory(newCategoryTitle, value, onChange)}
            onDelete={(id) => onChange(onDeleteCategory(value, id))}
            actionTitle="+ New category"
          >
            <Select.Frame>
              <Select.Header />
              <Select.AddRow />
              <Select.List />
            </Select.Frame>
          </Select.Provider>
          {errors.categories?.message ? (
            <FormControlError>
              <FormControlErrorText>{errors.categories.message}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>
      )}
    />
  );
}
