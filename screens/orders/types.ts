import type { CartItem } from '@/payload/types';

export function cartItemUnitPrice(item: CartItem): number {
  if (item.unitPriceInPKR != null && Number.isFinite(item.unitPriceInPKR)) {
    return item.unitPriceInPKR;
  }
  return item.variant?.priceInPKR ?? item.product.priceInPKR ?? 0;
}

/** Unit cost for COGS; null when cost is not tracked on the line or catalog. */
export function cartItemUnitCost(item: CartItem): number | null {
  if (item.unitCostInPKR != null && Number.isFinite(item.unitCostInPKR)) {
    return item.unitCostInPKR;
  }
  const fromCatalog = item.variant?.costInPKR ?? item.product.costInPKR;
  return fromCatalog != null && Number.isFinite(fromCatalog) ? fromCatalog : null;
}

export function cartItemListKey(item: CartItem): string {
  if (item.variant) {
    return `${item.product.id}-${item.variant.id}`;
  }
  return item.id;
}
