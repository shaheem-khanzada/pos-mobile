import { Q } from '@nozbe/watermelondb';

import type { Product as CatalogProduct, Variant } from '@/payload/types';
import { database } from '../db';
import Category from '../model/Category';
import Media from '../model/Media';
import Order from '../model/Order';
import OrderItem from '../model/OrderItem';
import Product from '../model/Product';
import ProductVariant from '../model/ProductVariant';
import Report from '../model/Report';
import VariantOption from '../model/VariantOption';
import VariantType from '../model/VariantType';
import { resetSyncMetaStore } from '../pull/sync-meta-store';
import { getSelectedTenantId } from '@/screens/auth/stores/auth-store';

export function defaultClauses(): Q.Clause[] {
  return [
    Q.where('sync_state', Q.notEq('deleted')),
    Q.where('tenant', getSelectedTenantId()),
    Q.sortBy('updated_at', Q.desc),
  ];
}

export const deleteDatabase = async () => {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
  resetSyncMetaStore();
};

export function fetchProductsObservable(params?: {
  search?: string;
}) {
  const filters: Q.Clause[] = defaultClauses();

  const search = params?.search?.trim() ?? '';
  if (search) {
    const like = `%${Q.sanitizeLikeString(search)}%`;
    filters.push(
      Q.or(
        Q.where('title', Q.like(like)),
        Q.where('barcode', Q.like(like)),
        Q.where('slug', Q.like(like)),
        Q.where('id', Q.like(like))
      )
    );
  }

  return database
    .get<Product>('products')
    .query(...filters)
    .observe();
}

const variantListClauses = (productId: string): Q.Clause[] => [
  Q.where('product_id', productId),
  Q.where('sync_state', Q.notEq('deleted')),
  Q.where('tenant', getSelectedTenantId()),
  Q.sortBy('updated_at', Q.desc),
];

export function observeVariantsForProduct(productId: string) {
  return database
    .get<ProductVariant>('variants')
    .query(...variantListClauses(productId))
    .observe();
}

export function mapWmProductToCatalog(
  product: Product,
  media: Media | null,
  variants: ProductVariant[]
): CatalogProduct {
  const mediaPayload = media
    ? { id: media.id, url: media.url ?? '', alt: media.alt ?? '' }
    : { id: '', url: '', alt: '' };

  const variantPayload: Variant[] = variants.map((v) => ({
    id: v.id,
    barcode: v.barcode,
    title: v.title,
    inventory: v.inventory,
    priceInPKR: v.priceInPKR,
    costInPKR: v.costInPKR,
    priceInPKREnabled: v.priceInPKREnabled,
    costInPKREnabled: v.costInPKREnabled,
    options: v.options ?? undefined,
  }));

  return {
    id: product.id,
    title: product.title,
    barcode: product.barcode,
    description: product.description,
    categories: [],
    media: mediaPayload,
    inventory: product.inventory,
    enableVariants: product.enableVariants,
    variantTypes: product.variantTypes ?? [],
    variants: variantPayload,
    priceInPKREnabled: product.priceInPKREnabled ?? undefined,
    priceInPKR: product.priceInPKR ?? undefined,
    costInPKREnabled: product.costInPKREnabled,
    costInPKR: product.costInPKR,
    slug: product.slug,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    deletedAt: product.deletedAt?.toISOString() ?? null,
  };
}

export async function hydrateWmProductToCatalog(
  product: Product
): Promise<CatalogProduct> {
  let mediaRecord: Media | null = null;
  try {
    mediaRecord = await product.media.fetch();
  } catch {
    mediaRecord = null;
  }

  const variantRows = await database
    .get<ProductVariant>('variants')
    .query(...variantListClauses(product.id))
    .fetch();

  return mapWmProductToCatalog(product, mediaRecord, variantRows);
}

export function fetchVariantsObservable(params?: {
  productId?: string;
  search?: string;
}) {
  const filters: Q.Clause[] = defaultClauses();

  if (params?.productId) {
    filters.push(Q.where('product_id', params.productId));
  }

  const search = params?.search?.trim() ?? '';
  if (search) {
    const like = `%${Q.sanitizeLikeString(search)}%`;
    filters.push(
      Q.or(
        Q.where('title', Q.like(like)),
        Q.where('barcode', Q.like(like))
      )
    );
  }

  return database
    .get<ProductVariant>('variants')
    .query(...filters)
    .observe();
}

export function fetchOrdersObservable(params?: {
  status?: string;
  search?: string;
}) {
  const filters: Q.Clause[] = defaultClauses();

  if (params?.status) {
    filters.push(Q.where('status', params.status));
  }

  const search = params?.search?.trim() ?? '';
  if (search) {
    const like = `%${Q.sanitizeLikeString(search)}%`;
    filters.push(
      Q.or(
        Q.where('customer_name', Q.like(like)),
        Q.where('customer_phone', Q.like(like))
      )
    );
  }

  return database
    .get<Order>('orders')
    .query(...filters)
    .observe();
}

/** Purchased carts only — for dashboards / receipts metrics. */
export function fetchPurchasedOrdersObservable() {
  const filters: Q.Clause[] = defaultClauses();
  filters.push(Q.where('status', 'purchased'));
  return database
    .get<Order>('orders')
    .query(...filters)
    .observe();
}

export function fetchOrderItemsObservable(orderId: string) {
  return database
    .get<OrderItem>('order_items')
    .query(
      Q.where('order_id', orderId),
      Q.sortBy('created_at', Q.desc)
    )
    .observe();
}

export function fetchCategoriesObservable(params?: {
  search?: string;
}) {
  const filters: Q.Clause[] = defaultClauses();

  const search = params?.search?.trim() ?? '';

  if (search) {
    const like = `%${Q.sanitizeLikeString(search)}%`;
    filters.push(Q.where('title', Q.like(like)));
  }

  return database
    .get<Category>('categories')
    .query(...filters)
    .observe();
}

export function fetchVariantTypesObservable(params?: {
  search?: string;
}) {
  const filters: Q.Clause[] = defaultClauses();

  const search = params?.search?.trim() ?? '';
  if (search) {
    const like = `%${Q.sanitizeLikeString(search)}%`;
    filters.push(
      Q.or(
        Q.where('label', Q.like(like)),
        Q.where('name', Q.like(like))
      )
    );
  }

  return database
    .get<VariantType>('variant_types')
    .query(...filters)
    .observe();
}

export function fetchVariantOptionsObservable(params?: {
  variantTypeId?: string;
  search?: string;
}) {
  const filters: Q.Clause[] = defaultClauses();

  if (params?.variantTypeId) {
    filters.push(Q.where('variant_type', params.variantTypeId));
  }

  const search = params?.search?.trim() ?? '';
  if (search) {
    const like = `%${Q.sanitizeLikeString(search)}%`;
    filters.push(
      Q.or(
        Q.where('label', Q.like(like)),
        Q.where('value', Q.like(like))
      )
    );
  }

  return database
    .get<VariantOption>('variant_options')
    .query(...filters)
    .observe();
}

export function fetchMediaObservable() {
  const filters: Q.Clause[] = defaultClauses();

  return database
    .get<Media>('media')
    .query(...filters)
    .observe();
}

/** One row per tenant — same fields as API `data`. */
export function observeReportsForTenant(tenantId: string) {
  return database
    .get<Report>('reports')
    .query(Q.where('tenant', tenantId))
    .observe();
}

export function observeReportForCurrentTenant() {
  return observeReportsForTenant(getSelectedTenantId());
}
