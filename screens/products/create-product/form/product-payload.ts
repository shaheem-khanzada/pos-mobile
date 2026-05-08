import type { CreateLocalProductInput } from '@/database';
import type { ProductFormValues } from './types';

function optionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

type BuildProductPayloadParams = {
  values: ProductFormValues;
  mediaId: string;
  tenant?: string | null;
};

export function buildProductPayload({
  values,
  mediaId,
  tenant,
}: BuildProductPayloadParams): CreateLocalProductInput {
  const enableVariants = values.enableVariants;
  const price = enableVariants ? null : optionalNumber(values.priceInPKR);
  const cost = enableVariants ? null : optionalNumber(values.costInPKR);

  return {
    title: values.title.trim(),
    description: optionalText(values.description),
    barcode: enableVariants ? null : optionalText(values.barcode),
    priceInPKR: price,
    priceInPKREnabled: enableVariants ? null : price != null,
    costInPKR: cost,
    costInPKREnabled: enableVariants ? null : cost != null,
    inventory: enableVariants ? null : optionalNumber(values.inventory),
    enableVariants,
    variantTypes: enableVariants ? values.variantTypes : [],
    categories: values.categories,
    media: mediaId,
    tenant: tenant ?? undefined,
  };
}
