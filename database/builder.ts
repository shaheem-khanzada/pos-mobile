import type { Cart } from './types';
import type { Product, Variant } from './types';
import { asDate, asMillis, extractId } from './utils';

export function buildOrder(order: Cart) {
  const createdAt = asDate(order.createdAt);
  const updatedAt = asDate(order.updatedAt);

  return {
    status: order.status ?? 'purchased',
    paymentMethod: order.paymentMethod ?? 'cash',
    customerName: order.customerName ?? 'Walk-in Customer',
    customerPhone: order.customerPhone ?? null,
    currency: order.currency ?? 'PKR',
    subtotal: order.subtotal ?? null,
    tenant: extractId((order.tenant)),
    syncState: 'synced' as const,
    purchasedAt: order.purchasedAt
      ? asDate(order.purchasedAt)
      : asDate(order.createdAt, updatedAt),
    createdAt,
    updatedAt,
  };
}

export function buildProduct(product: Product) {
  const deletedAt = asMillis(product.deletedAt ?? null);
  const createdAt = asMillis(product.createdAt) ?? Date.now();
  const updatedAt = asMillis(product.updatedAt) ?? Date.now();

  return {
    title: product.title,
    description: product.description ?? null,
    barcode: product.barcode ?? null,
    inventory: product.inventory ?? null,
    enableVariants: product.enableVariants ?? null,
    priceInPKREnabled: product.priceInPKREnabled ?? null,
    priceInPKR: product.priceInPKR ?? null,
    slug: product.slug,
    media: product.media && typeof product.media !== 'string' ? product.media : null,
    tenant: extractId(product.tenant),
    syncState: 'synced' as const,
    deletedAt: deletedAt ? new Date(deletedAt) : null,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
}

export function buildVariant(
  variant: Variant,
) {
  const now = new Date();
  return {
    title: variant.title ?? null,
    barcode: variant.barcode ?? null,
    inventory: variant.inventory ?? null,
    priceInPKREnabled: true,
    priceInPKR: variant.priceInPKR ?? null,
    optionsJson: JSON.stringify(variant.options ?? []),
    tenant: extractId(variant.tenant),
    syncState: 'synced' as const,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
