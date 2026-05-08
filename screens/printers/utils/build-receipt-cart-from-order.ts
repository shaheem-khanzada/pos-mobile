import database from '@/database';
import type Order from '@/database/model/Order';
import type OrderItem from '@/database/model/OrderItem';
import Product from '@/database/model/Product';
import ProductVariant from '@/database/model/ProductVariant';
import type { Cart, CartItem, Product as PayloadProduct, Variant } from '@/payload/types';

async function productPayloadFromLine(line: OrderItem): Promise<PayloadProduct> {
  const raw = line._raw as { product_id?: string };
  const pid = raw.product_id;
  if (!pid) {
    return {
      id: 'unknown',
      title: 'Product',
      slug: '',
      categories: [],
      media: { id: '', alt: '', url: '' },
    };
  }
  try {
    const p = await database.get<Product>('products').find(pid);
    return {
      id: p.id,
      title: p.title,
      slug: p.slug ?? '',
      categories: [],
      media: { id: '', alt: '', url: '' },
      priceInPKR: p.priceInPKR ?? undefined,
    };
  } catch {
    return {
      id: pid,
      title: 'Product',
      slug: '',
      categories: [],
      media: { id: '', alt: '', url: '' },
    };
  }
}

async function variantPayloadFromLine(line: OrderItem): Promise<Variant | undefined> {
  const raw = line._raw as { variant_id?: string | null };
  const vid = raw.variant_id;
  if (!vid) return undefined;
  try {
    const v = await database.get<ProductVariant>('variants').find(vid);
    return {
      id: v.id,
      title: v.title ?? undefined,
      priceInPKR: v.priceInPKR ?? undefined,
    };
  } catch {
    return undefined;
  }
}

/** Builds a Payload-shaped `Cart` from a Watermelon order + lines for ESC/POS receipt printing. */
export async function buildReceiptCartFromOrder(order: Order): Promise<Cart> {
  const lines = await order.items.fetch();
  const items: CartItem[] = [];

  for (const line of lines) {
    const product = await productPayloadFromLine(line);
    const variant = await variantPayloadFromLine(line);
    items.push({
      id: line.id,
      quantity: line.quantity,
      product,
      variant,
      unitPriceInPKR: line.unitPriceInPKR,
      unitCostInPKR: line.unitCostInPKR,
    });
  }

  return {
    id: order.id,
    items,
    customerName: order.customerName,
    customerPhone: order.customerPhone ?? undefined,
    paymentMethod: order.paymentMethod,
    status: order.status as Cart['status'],
    subtotal: order.subtotal ?? 0,
    discount: order.discount ?? 0,
    currency: (order.currency as Cart['currency']) ?? 'PKR',
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    purchasedAt: order.purchasedAt?.toISOString() ?? null,
  };
}
