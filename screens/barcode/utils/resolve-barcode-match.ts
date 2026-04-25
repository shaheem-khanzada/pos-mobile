import type { Product, Variant } from '@/payload/types';

import { catalogHasVariants } from '@/screens/orders/utils/product-catalog';

type ProductWithVariants = Omit<Product, 'variants'> & {
  variants?: Variant[];
};

function normalizeBarcode(value: string): string {
  return value.trim().toLowerCase();
}

export type BarcodeCatalogMatch =
  | { kind: 'simple'; product: Product }
  | { kind: 'variant'; product: Product; variant: Variant };

/**
 * Resolve a scanned barcode to a product (no variants) or a specific variant.
 */
export function resolveBarcodeToCatalogMatch(
  products: ProductWithVariants[],
  rawCode: string
): BarcodeCatalogMatch | null {
  const code = normalizeBarcode(rawCode);
  if (!code) return null;

  for (const p of products) {
    const productBarcode = normalizeBarcode(p.barcode ?? '');

    if (productBarcode && productBarcode === code) {
      if (!catalogHasVariants(p)) {
        return { kind: 'simple', product: p };
      }
      const only = p.variants?.[0];
      if ((p.variants?.length ?? 0) === 1 && only) {
        return { kind: 'variant', product: p, variant: only };
      }
      return null;
    }

    if (catalogHasVariants(p) && p.variants) {
      for (const raw of p.variants) {
        const vb = normalizeBarcode(raw.barcode ?? '');
        if (!vb || vb !== code) continue;
        return { kind: 'variant', product: p, variant: raw };
      }
    }
  }

  return null;
}
