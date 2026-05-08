import type ProductVariant from '@/database/model/ProductVariant';

export const VARIANT_INVALID_MESSAGE =
  'This variant no longer matches selected variant types.';

export function normalizeOptionIds(ids: string[] | null | undefined): string {
  return [...(ids ?? [])].sort().join('|');
}

type MissingOptionsError = {
  kind: 'missing-options';
  missingTypeIds: string[];
};

type DuplicateError = {
  kind: 'duplicate';
  firstTypeId: string;
};

export type VariantSubmissionError = MissingOptionsError | DuplicateError;

type FindSubmissionErrorParams = {
  selectedVariantTypeIds: string[];
  optionIdsByType: Record<string, string | null>;
  selectedOptionIds: string[];
  variants: ProductVariant[];
  selectedVariantId?: string | null;
};

export function findVariantSubmissionError({
  selectedVariantTypeIds,
  optionIdsByType,
  selectedOptionIds,
  variants,
  selectedVariantId,
}: FindSubmissionErrorParams): VariantSubmissionError | null {
  const missingTypeIds = selectedVariantTypeIds.filter((typeId) => !optionIdsByType[typeId]);
  if (missingTypeIds.length > 0) {
    return { kind: 'missing-options', missingTypeIds };
  }

  const requestedKey = normalizeOptionIds(selectedOptionIds);
  const duplicate = variants.find((variant) => {
    if (selectedVariantId && variant.id === selectedVariantId) return false;
    return normalizeOptionIds(variant.options) === requestedKey;
  });
  if (duplicate) {
    return { kind: 'duplicate', firstTypeId: selectedVariantTypeIds[0] };
  }

  return null;
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

type IsVariantInvalidParams = {
  variant: ProductVariant;
  selectedVariantTypeIds: string[];
  optionTypeById: Record<string, string>;
};

export function isVariantInvalidForSelectedTypes({
  variant,
  selectedVariantTypeIds,
  optionTypeById,
}: IsVariantInvalidParams): boolean {
  const variantTypeIds = new Set(
    (variant.options ?? [])
      .map((optionId) => optionTypeById[optionId])
      .filter(Boolean)
  );
  return !setsEqual(variantTypeIds, new Set(selectedVariantTypeIds));
}
