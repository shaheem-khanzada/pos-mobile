import type { Cart, CartItem, Product, Variant } from '@/payload/types';

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

function isLikelyPayloadId(value: string | undefined): value is string {
  return Boolean(value && OBJECT_ID_RE.test(value));
}

export function paymentUiIdToCartMethod(
  id: 'cash' | 'card' | 'online'
): Cart['paymentMethod'] {
  if (id === 'cash') return 'cash';
  return 'online';
}

/** API cart `items` for `create` (relation ids; cast matches prior SDK usage). */
function buildCartItemsForApi(lines: CartItem[]): Cart['items'] {
  const out: Cart['items'] = [];
  for (const line of lines) {
    const productId = isLikelyPayloadId(line.product.id)
      ? line.product.id
      : undefined;
    if (!productId) continue;
    const variantId = line.variant?.id;
    const resolvedVariantId =
      isLikelyPayloadId(variantId) ? variantId
      : isLikelyPayloadId(productId) ? productId
      : undefined;
    if (!resolvedVariantId) continue;
    out.push({
      id: line.id,
      quantity: line.quantity,
      product: productId as unknown as Product,
      variant: resolvedVariantId as unknown as Variant,
    });
  }
  return out as Cart['items'];
}

/** Shape sent to `payloadSdk.create` for `carts` (placed order = `purchased`). */
export function buildCartCreatePayload(args: {
  cartItems: CartItem[];
  customerName: string;
  customerPhone: string;
  paymentUiId: 'cash' | 'card' | 'online';
  subtotalAfterDiscount: number;
}): Partial<Cart> {
  return {
    customerName: args.customerName.trim() || 'Guest',
    customerPhone: args.customerPhone.trim() || null,
    paymentMethod: paymentUiIdToCartMethod(args.paymentUiId),
    items: buildCartItemsForApi(args.cartItems),
    subtotal: args.subtotalAfterDiscount,
    currency: 'PKR',
    status: 'purchased',
    purchasedAt: new Date().toISOString(),
  };
}
