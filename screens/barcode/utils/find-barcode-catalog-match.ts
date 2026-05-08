import { Q } from '@nozbe/watermelondb';

import { database } from '@/database/db';
import { hydrateWmProductToCatalog } from '@/database';
import Product from '@/database/model/Product';
import ProductVariant from '@/database/model/ProductVariant';
import { getSelectedTenantId } from '@/screens/auth/stores/auth-store';

import {
  resolveBarcodeToCatalogMatch,
  type BarcodeCatalogMatch,
} from './resolve-barcode-match';

function tenantScopedActive(): Q.Clause[] {
  return [
    Q.where('sync_state', Q.notEq('deleted')),
    Q.where('tenant', getSelectedTenantId()),
  ];
}

/** Matches typical POS barcodes stored with mixed or fixed casing. */
function barcodeValueClause(raw: string): Q.Clause {
  const t = raw.trim();
  return Q.or(
    Q.where('barcode', t),
    Q.where('barcode', t.toLowerCase()),
    Q.where('barcode', t.toUpperCase())
  );
}

/**
 * Resolve a scanned code using local DB rows only (product or variant barcode).
 */
export async function findBarcodeCatalogMatch(
  rawCode: string
): Promise<BarcodeCatalogMatch | null> {
  const code = rawCode.trim();
  if (!code) return null;

  const scoped = tenantScopedActive();

  const productHits = await database
    .get<Product>('products')
    .query(...scoped, Q.where('barcode', Q.notEq(null)), barcodeValueClause(code))
    .fetch();

  const productHit = productHits[0];
  if (productHit) {
    const catalog = await hydrateWmProductToCatalog(productHit);
    return resolveBarcodeToCatalogMatch([catalog], rawCode);
  }

  const variantHits = await database
    .get<ProductVariant>('variants')
    .query(...scoped, Q.where('barcode', Q.notEq(null)), barcodeValueClause(code))
    .fetch();

  const variantHit = variantHits[0];
  if (!variantHit) return null;

  const parent = await variantHit.product.fetch();
  const catalog = await hydrateWmProductToCatalog(parent);
  return resolveBarcodeToCatalogMatch([catalog], rawCode);
}
