import type { CartItem } from '@/payload/types';

export function cartItemUnitPrice(item: CartItem): number {
  return item.variant?.priceInPKR ?? item.product.priceInPKR ?? 0;
}

export function cartItemListKey(item: CartItem): string {
  if (item.variant) {
    return `${item.product.id}-${item.variant.id}`;
  }
  return item.id;
}
