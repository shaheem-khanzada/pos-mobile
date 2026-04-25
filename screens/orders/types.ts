import type { CartItem } from '@/payload/types';

export function cartItemUnitPrice(item: CartItem): number {
  return item.variant?.priceInPKR ?? item.product.priceInPKR ?? 0;
}

/** One-line label for compact lists (create order row, barcode sheet). */
export function cartItemTitle(item: CartItem): string {
  const vt = item.variant?.title?.trim();
  if (vt) return `${item.product.title} — ${vt}`;
  return item.product.title;
}

export function cartItemListKey(item: CartItem): string {
  if (item.variant) {
    return `${item.product.id}-${item.variant.id}`;
  }
  return item.id;
}
