import type { CreateLocalVariantInput } from '@/database';
import type Product from '@/database/model/Product';
import type { VariantFormValues } from './types';

function optionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

type BuildVariantPayloadParams = {
  values: VariantFormValues;
  product: Product;
  selectedOptionIds: string[];
  selectedOptionLabels: string[];
};

export function buildVariantPayload({
  values,
  product,
  selectedOptionIds,
  selectedOptionLabels,
}: BuildVariantPayloadParams): CreateLocalVariantInput {
  const fallbackTitle = `${product.title} - ${selectedOptionLabels.join(' / ') || 'Variant'}`;
  const price = Number(values.priceInPKR);
  const cost = optionalNumber(values.costInPKR);

  return {
    productId: product.id,
    tenant: product.tenant,
    title: values.title.trim() || fallbackTitle,
    barcode: values.barcode.trim() || null,
    inventory: Number(values.inventory),
    priceInPKR: Number.isFinite(price) ? price : 0,
    priceInPKREnabled: true,
    costInPKR: cost,
    costInPKREnabled: cost != null,
    options: selectedOptionIds,
  };
}
