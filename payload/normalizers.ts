/**
 * API → app domain shaping. Prefer importing from `@/hooks/*` (e.g. mutations, queries,
 * `@/hooks/form-payload` for form helpers). Avoid calling these from ad-hoc screen logic.
 */
import type { Product } from './types';

export function relationIds<T extends { id: string }>(
  items: (string | T)[] | undefined | null
): string[] {
  const ids: string[] = [];
  for (const item of items ?? []) {
    if (typeof item === 'string') {
      ids.push(item);
      continue;
    }
    if (item?.id) ids.push(item.id);
  }
  return ids;
}

export function relationId<T extends { id: string }>(
  item: string | T | undefined | null
): string | undefined {
  if (!item) return undefined;
  if (typeof item === 'string') return item;
  return item.id || undefined;
}

export function buildProductFormInitialFromProduct(product: Product) {
  const p = product;
  return {
    product: {
      id: p.id,
      title: p.title ?? '',
      description: p.description ?? undefined,
      priceInPKR: p.priceInPKR ?? undefined,
      inventory: p.inventory ?? undefined,
      barcode: p.barcode ?? undefined,
      enableVariants: Boolean(p.enableVariants),
      priceInPKREnabled:
        typeof p.priceInPKREnabled === 'boolean'
          ? p.priceInPKREnabled
          : !Boolean(p.enableVariants),
      categories: relationIds(p.categories),
      variantTypes: p.variantTypes ?? [],
      media: p.media.id,
      variants: p.variants ?? [],
    },
    imagePreviewUri: p.media.thumbnailURL || null,
  };
}