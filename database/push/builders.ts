import Order from '../model/Order';
import OrderItem from '../model/OrderItem';
import Product from '../model/Product';
import ProductVariant from '../model/ProductVariant';

export function buildProductPushData(product: Product) {
  return {
    title: product.title,
    description: product.description ?? undefined,
    barcode: product.barcode ?? undefined,
    inventory: product.inventory ?? undefined,
    enableVariants: product.enableVariants ?? undefined,
    priceInPKREnabled: product.priceInPKREnabled ?? undefined,
    priceInPKR: product.priceInPKR ?? undefined,
    slug: product.slug,
    media: product.media ?? undefined,
    tenant: product.tenant ?? undefined,
  };
}

export function buildVariantPushData(variant: ProductVariant) {
  const productId = (variant as any)._raw?.product_id ?? (variant as any).product?.id;
  return {
    title: variant.title ?? undefined,
    barcode: variant.barcode ?? undefined,
    inventory: variant.inventory ?? undefined,
    priceInPKREnabled: variant.priceInPKREnabled ?? undefined,
    priceInPKR: variant.priceInPKR ?? undefined,
    options: Array.isArray(variant.options) ? variant.options : [],
    tenant: variant.tenant ?? undefined,
    product: productId,
  };
}

export function buildOrderPushData(order: Order, items: OrderItem[]) {
  const payloadItems = items.map((item) => {
    const raw = (item as any)._raw ?? {};
    return {
      product: raw.product_id ?? null,
      variant: raw.variant_id ?? null,
      quantity: item.quantity,
    };
  });

  return {
    customerName: order.customerName,
    customerPhone: order.customerPhone ?? undefined,
    subtotal: order.subtotal ?? undefined,
    paymentMethod: order.paymentMethod,
    currency: order.currency ?? 'PKR',
    status: order.status,
    tenant: order.tenant ?? undefined,
    purchasedAt: order.purchasedAt ? order.purchasedAt.toISOString() : undefined,
    items: payloadItems,
  };
}
