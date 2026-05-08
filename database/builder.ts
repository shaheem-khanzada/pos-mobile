import type { Cart } from './types';
import type { Category, Media, Product, Variant, VariantOption, VariantType } from './types';
import { asDate, asMillis, extractId } from './utils';

function extractIds(values: unknown[] | undefined | null): string[] {
  const ids: string[] = [];
  for (const value of values ?? []) {
    const id = extractId(value as string | { id: string } | null | undefined);
    if (id) ids.push(id);
  }
  return ids;
}

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
    discount: order.discount ?? null,
    cogsTotal: order.cogsTotal ?? null,
    grossProfit: order.grossProfit ?? null,
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

  const costInPKR = product.costInPKR ?? null;
  const costInPKREnabled =
    typeof product.costInPKREnabled === 'boolean'
      ? product.costInPKREnabled
      : costInPKR != null;

  return {
    title: product.title,
    description: product.description ?? null,
    barcode: product.barcode ?? null,
    inventory: product.inventory ?? null,
    enableVariants: product.enableVariants ?? null,
    priceInPKREnabled: product.priceInPKREnabled ?? null,
    priceInPKR: product.priceInPKR ?? null,
    costInPKREnabled,
    costInPKR,
    slug: product.slug ?? '',
    media: extractId(product.media),
    categories: extractIds(product.categories),
    variantTypes: extractIds(product.variantTypes),
    tenant: extractId(product.tenant),
    syncState: 'synced',
    deletedAt: deletedAt ? new Date(deletedAt) : null,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
}

export function buildVariant(
  variant: Variant,
) {
  const now = new Date();
  const priceInPKR = variant.priceInPKR ?? null;
  const costInPKR = variant.costInPKR ?? null;
  const priceInPKREnabled =
    typeof variant.priceInPKREnabled === 'boolean'
      ? variant.priceInPKREnabled
      : priceInPKR != null;
  const costInPKREnabled =
    typeof variant.costInPKREnabled === 'boolean'
      ? variant.costInPKREnabled
      : costInPKR != null;

  return {
    title: variant.title ?? null,
    barcode: variant.barcode ?? null,
    inventory: variant.inventory ?? null,
    priceInPKREnabled,
    priceInPKR,
    costInPKREnabled,
    costInPKR,
    options: Array.isArray(variant.options) ? variant.options : [],
    tenant: extractId(variant.tenant),
    syncState: 'synced' as const,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildCategory(category: Category & { deletedAt?: string | null }) {
  const deletedAt = asMillis(category.deletedAt ?? null);
  const createdAt = asMillis((category as any).createdAt) ?? Date.now();
  const updatedAt = asMillis((category as any).updatedAt) ?? Date.now();

  return {
    title: category.title,
    tenant: extractId((category as any).tenant),
    syncState: 'synced' as const,
    deletedAt: deletedAt ? new Date(deletedAt) : null,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
}

export function buildVariantType(variantType: VariantType & { deletedAt?: string | null }) {
  const deletedAt = asMillis(variantType.deletedAt ?? null);
  const createdAt = asMillis((variantType as any).createdAt) ?? Date.now();
  const updatedAt = asMillis((variantType as any).updatedAt) ?? Date.now();

  return {
    label: variantType.label,
    name: variantType.name,
    tenant: extractId((variantType as any).tenant),
    syncState: 'synced' as const,
    deletedAt: deletedAt ? new Date(deletedAt) : null,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
}

export function buildVariantOption(variantOption: VariantOption & { deletedAt?: string | null }) {
  const deletedAt = asMillis(variantOption.deletedAt ?? null);
  const createdAt = asMillis((variantOption as any).createdAt) ?? Date.now();
  const updatedAt = asMillis((variantOption as any).updatedAt) ?? Date.now();

  return {
    label: variantOption.label,
    value: variantOption.value,
    tenant: extractId((variantOption as any).tenant),
    syncState: 'synced' as const,
    deletedAt: deletedAt ? new Date(deletedAt) : null,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
}

export function buildMedia(media: Media & { deletedAt?: string | null }) {
  const deletedAt = asMillis(media.deletedAt ?? null);
  const createdAt = asMillis((media as any).createdAt) ?? Date.now();
  const updatedAt = asMillis((media as any).updatedAt) ?? Date.now();

  return {
    alt: media.alt ?? '',
    url: media.url ?? '',
    fileName: (media as any).fileName ?? null,
    mimeType: (media as any).mimeType ?? null,
    tenant: extractId((media as any).tenant),
    syncState: 'synced' as const,
    deletedAt: deletedAt ? new Date(deletedAt) : null,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
}
