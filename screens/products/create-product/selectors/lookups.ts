import type { SelectItem } from '@/components/select';
import type { Category, VariantOption, VariantType } from '@/database/model';

export function buildCategoryOptions(categories: Category[]): SelectItem[] {
  return categories.map((category) => ({ id: category.id, label: category.title }));
}

export function buildVariantTypeItems(variantTypes: VariantType[]): SelectItem[] {
  return variantTypes.map((type) => ({ id: type.id, label: type.label }));
}

export function buildVariantTypeLabelById(
  variantTypes: VariantType[]
): Record<string, string> {
  return variantTypes.reduce<Record<string, string>>((acc, type) => {
    acc[type.id] = type.label;
    return acc;
  }, {});
}

export function buildVariantTypeOptionsMap(
  variantOptions: VariantOption[]
): Record<string, SelectItem[]> {
  return variantOptions.reduce<Record<string, SelectItem[]>>((acc, option) => {
    if (!acc[option.variantTypeId]) {
      acc[option.variantTypeId] = [];
    }
    acc[option.variantTypeId].push({ id: option.id, label: option.label });
    return acc;
  }, {});
}

export function buildVariantOptionLabelById(
  variantOptions: VariantOption[]
): Record<string, string> {
  return variantOptions.reduce<Record<string, string>>((acc, option) => {
    acc[option.id] = option.label;
    return acc;
  }, {});
}

export function buildOptionTypeById(variantOptions: VariantOption[]): Record<string, string> {
  return variantOptions.reduce<Record<string, string>>((acc, option) => {
    acc[option.id] = option.variantTypeId;
    return acc;
  }, {});
}
