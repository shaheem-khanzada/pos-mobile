import type { CartItem, Product, Variant } from '@/payload/types';

function newCartItemId(): string {
  return `l${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Picker + cart merge use the same shape as API `Product`. */
export type CatalogProduct = Product;

/** `true` when the product should open the variant sheet (not quick +/−). */
export function catalogHasVariants(product: Product): boolean {
  return Boolean(product.enableVariants && (product.variants?.length ?? 0) > 0);
}

/** Lowest variant `priceInPKR`, or base product price when there are no variant rows. */
export function catalogMinPrice(product: Product): number {
  const rows = product.variants ?? [];
  if (!product.enableVariants || rows.length === 0) {
    return product.priceInPKR ?? 0;
  }
  return Math.min(
    ...rows.map((v) => v.priceInPKR ?? product.priceInPKR ?? 0)
  );
}

export const PRODUCT_CATALOG: Product[] = [
  {
    id: 'c1',
    title: 'Meezan Cooking Oil',
    slug: 'c1',
    categories: [],
    media: { id: 'c1-media', alt: '', url: '' },
    priceInPKR: 650,
    enableVariants: true,
    variants: [
      { id: 'c1-1l', title: '1 Litre', priceInPKR: 650, inventory: 45 },
      { id: 'c1-5l', title: '5 Litre', priceInPKR: 3200, inventory: 18 },
      { id: 'c1-10l', title: '10 Litre', priceInPKR: 6000, inventory: 12 },
    ],
  },
  {
    id: 'c2',
    title: 'National Salt (1kg)',
    slug: 'c2',
    categories: [],
    media: { id: 'c2-media', alt: '', url: '' },
    priceInPKR: 40,
    enableVariants: false,
  },
  {
    id: 'c3',
    title: 'Tapal Danedar Tea',
    slug: 'c3',
    categories: [],
    media: { id: 'c3-media', alt: '', url: '' },
    priceInPKR: 210,
    enableVariants: true,
    variants: [
      { id: 'c3-250', title: '250g', priceInPKR: 210, inventory: 80 },
      { id: 'c3-475', title: '475g', priceInPKR: 380, inventory: 55 },
      { id: 'c3-950', title: '950g', priceInPKR: 720, inventory: 30 },
    ],
  },
];

/** Sum qty across all order lines for this product id. */
export function qtyForCatalog(cartItems: CartItem[], productId: string): number {
  return cartItems
    .filter((l) => l.product.id === productId)
    .reduce((sum, l) => sum + l.quantity, 0);
}

export type MergeVariantPayload = {
  productId: string;
  variantId: string;
  name: string;
  priceInPKR: number;
  quantity: number;
  payloadProductId?: string;
  variantRelationId?: string;
};

function variantById(product: Product, variantId: string): Variant | undefined {
  return product.variants?.find((v) => v.id === variantId);
}

/**
 * Replace all variant rows for `product` with `items` (one line per variant, qty from sheet).
 * Pressing ADD again with the same sheet state does not stack quantities.
 */
export function applyVariantSelectionToCartItems(
  cartItems: CartItem[],
  product: Product,
  items: MergeVariantPayload[]
): CartItem[] {
  const pid = product.id;
  const base = cartItems.filter(
    (l) => !(l.product.id === pid && l.variant)
  );
  const additions: CartItem[] = items
    .filter((it) => it.quantity > 0)
    .map((it) => ({
      id: newCartItemId(),
      quantity: it.quantity,
      product,
      variant:
        variantById(product, it.variantId) ?? ({ id: it.variantId } as Variant),
    }));
  return [...base, ...additions];
}

/** Add +1 qty for a specific variant line (barcode scan / quick add). */
export function addOrIncrementVariantCartItem(
  cartItems: CartItem[],
  product: Product,
  variant: Variant
): CartItem[] {
  if (!catalogHasVariants(product)) return cartItems;
  const idx = cartItems.findIndex(
    (l) => l.product.id === product.id && l.variant?.id === variant.id
  );
  if (idx >= 0) {
    return cartItems.map((l, i) =>
      i === idx ? { ...l, quantity: l.quantity + 1 } : l
    );
  }
  return [
    ...cartItems,
    {
      id: newCartItemId(),
      quantity: 1,
      product,
      variant,
    },
  ];
}

export function addOrIncrementCatalogCartItem(
  cartItems: CartItem[],
  product: Product
): CartItem[] {
  if (catalogHasVariants(product)) return cartItems;
  const idx = cartItems.findIndex(
    (l) => l.product.id === product.id && !l.variant
  );
  if (idx >= 0) {
    return cartItems.map((l, i) =>
      i === idx ? { ...l, quantity: l.quantity + 1 } : l
    );
  }
  return [
    ...cartItems,
    {
      id: newCartItemId(),
      quantity: 1,
      product,
    },
  ];
}

/** Decrement qty or remove line when qty would hit 0 (no-variant SKUs in picker). */
export function decrementOrRemoveCatalogCartItem(
  cartItems: CartItem[],
  product: Product
): CartItem[] {
  if (catalogHasVariants(product)) return cartItems;
  const idx = cartItems.findIndex(
    (l) => l.product.id === product.id && !l.variant
  );
  if (idx < 0) return cartItems;
  const row = cartItems[idx];
  if (row.quantity <= 1) {
    return cartItems.filter((_, i) => i !== idx);
  }
  return cartItems.map((l, i) =>
    i === idx ? { ...l, quantity: l.quantity - 1 } : l
  );
}
