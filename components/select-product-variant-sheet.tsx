import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers, Minus, Plus, X } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import {
  BottomSheetItem,
  BottomSheetScrollView,
} from '@/components/ui/bottomsheet';
import { SheetQtyRowCard } from '@/components/orders/sheet-qty-row-card';
import { cn } from '@/lib/cn';
import { formatRs } from '@/lib/format-rs';
import { fieldLabelClass } from '@/theme/ui';
import type { CartItem, Product, Variant } from '@/payload/types';

export type VariantSheetConfirmPayload = {
  variantId: string;
  itemDisplayName: string;
  priceInPKR: number;
  qty: number;
};

/** Batch add when multi-select mode confirms */
export type VariantSheetConfirmMultiPayload = {
  items: VariantSheetConfirmPayload[];
};

export type VariantSheetConfirmUnion =
  | VariantSheetConfirmPayload
  | VariantSheetConfirmMultiPayload;

export function isVariantSheetMultiPayload(
  p: VariantSheetConfirmUnion
): p is VariantSheetConfirmMultiPayload {
  return (
    typeof p === 'object' &&
    p !== null &&
    'items' in p &&
    Array.isArray((p as VariantSheetConfirmMultiPayload).items)
  );
}

/** Seed UI from cart lines for this product (`line.product.id` === `product.id`). */
function deriveVariantSheetSeed(
  product: Product,
  cartItems: CartItem[],
  variants: Variant[]
): {
  isMulti: boolean;
  variantQty: Record<string, number>;
  selectedVariantId: string;
  qty: number;
} {
  const productId = product.id;
  const qtyByVariant: Record<string, number> = {};
  for (const v of variants) qtyByVariant[v.id] = 0;

  for (const line of cartItems) {
    if (line.product.id !== productId || !line.variant) continue;
    const vid = line.variant.id;
    if (!(vid in qtyByVariant)) continue;
    qtyByVariant[vid] += line.quantity;
  }

  const activeVariants = variants.filter((v) => qtyByVariant[v.id] > 0);
  if (activeVariants.length > 1) {
    return {
      isMulti: true,
      variantQty: { ...qtyByVariant },
      selectedVariantId: variants[0]?.id ?? '',
      qty: 1,
    };
  }
  if (activeVariants.length === 1) {
    const v = activeVariants[0];
    const q = qtyByVariant[v.id] ?? 1;
    return {
      isMulti: false,
      variantQty: Object.fromEntries(variants.map((x) => [x.id, 0])),
      selectedVariantId: v.id,
      qty: Math.max(1, q),
    };
  }
  return {
    isMulti: false,
    variantQty: Object.fromEntries(variants.map((x) => [x.id, 0])),
    selectedVariantId: variants[0]?.id ?? '',
    qty: 1,
  };
}

export type SelectProductVariantSheetContentProps = {
  product: Product;
  /** Current cart items; used to restore qty / multi mode when reopening the sheet. */
  cartItems: CartItem[];
  onConfirm: (payload: VariantSheetConfirmUnion) => void;
};

/**
 * Inner UI for the variant + quantity sheet. Render inside {@link BottomSheetPortal}
 * (sibling to your `FlatList`, under {@link BottomSheet}) so the sheet is not nested
 * in list cells.
 */
export function SelectProductVariantSheetContent({
  product,
  cartItems,
  onConfirm,
}: SelectProductVariantSheetContentProps) {
  const variants = product.variants ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => variants[0]?.id ?? ''
  );
  const [qty, setQty] = useState(1);
  /** Single list (pick one variant + qty) vs multi list (qty per variant). */
  const [isMulti, setIsMulti] = useState(false);
  const [variantQty, setVariantQty] = useState<Record<string, number>>({});

  const cartSignature = useMemo(
    () =>
      cartItems
        .filter((l) => l.product.id === product.id && l.variant)
        .map((l) => `${l.variant!.id}:${l.quantity}`)
        .sort()
        .join('|'),
    [cartItems, product.id]
  );

  /** Sorted ids so effect deps stay stable when parent passes new `variants` array refs. */
  const variantKeySorted = [...variants].map((v) => v.id).sort().join(',');

  useEffect(() => {
    const v = product.variants ?? [];
    const seed = deriveVariantSheetSeed(product, cartItems, v);
    setIsMulti(seed.isMulti);
    setVariantQty(seed.variantQty);
    setSelectedVariantId(seed.selectedVariantId);
    setQty(seed.qty);
    // Intentionally omit `product` / `cartItems` / `variants` refs — use primitive signatures only.
  }, [product.id, variantKeySorted, cartSignature]);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0],
    [variants, selectedVariantId]
  );

  const lineTotal = useMemo(() => {
    if (!selectedVariant) return 0;
    return (selectedVariant.priceInPKR ?? 0) * qty;
  }, [selectedVariant, qty]);

  const multiLineTotal = useMemo(() => {
    return variants.reduce((sum, v) => {
      const q = variantQty[v.id] ?? 0;
      return sum + (v.priceInPKR ?? 0) * q;
    }, 0);
  }, [variants, variantQty]);

  const incVariant = useCallback((id: string, stock: number) => {
    setVariantQty((prev) => ({
      ...prev,
      [id]: Math.min(stock, (prev[id] ?? 0) + 1),
    }));
  }, []);

  const decVariant = useCallback((id: string) => {
    setVariantQty((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) - 1),
    }));
  }, []);

  const submitSingle = useCallback(() => {
    if (!selectedVariant) return;
    onConfirm({
      variantId: selectedVariant.id,
      itemDisplayName: selectedVariant.title ?? '',
      priceInPKR: selectedVariant.priceInPKR ?? 0,
      qty,
    });
  }, [onConfirm, qty, selectedVariant]);

  const submitMulti = useCallback(() => {
    const items: VariantSheetConfirmPayload[] = variants
      .map((v) => {
        const q = variantQty[v.id] ?? 0;
        if (q <= 0) return null;
        return {
          variantId: v.id,
          itemDisplayName: v.title ?? '',
          priceInPKR: v.priceInPKR ?? 0,
          qty: q,
        };
      })
      .filter((x): x is VariantSheetConfirmPayload => x !== null);
    if (items.length === 0) return;
    onConfirm({ items });
  }, [onConfirm, variantQty, variants]);

  if (variants.length === 0) {
    return null;
  }

  return (
    <BottomSheetScrollView
      className="flex-1 bg-app-surface"
      contentContainerClassName="pb-8 pt-1"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <VStack space="lg" className="px-5">
        <HStack className="items-start justify-between gap-3">
          <VStack space="xs" className="min-w-0 flex-1 pr-2">
            <Text className="text-xl font-bold text-typography-900 dark:text-typography-0">
              {product.title}
            </Text>
            <Text className="text-sm leading-snug text-secondary-500 dark:text-typography-400">
              Select preferred variant & quantity
            </Text>
          </VStack>
          <BottomSheetItem
            className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-100 p-0 active:opacity-80 dark:bg-background-200"
            hitSlop={12}
          >
            <Icon
              as={X}
              size="md"
              className="text-typography-900 dark:text-typography-0"
            />
          </BottomSheetItem>
        </HStack>

        <HStack className="w-full items-center justify-between px-1 py-1">
          <HStack className="min-w-0 flex-1 items-center gap-2 pr-3">
            <Icon as={Layers} size="sm" className="text-primary-500" />
            <Text className="text-sm font-bold uppercase tracking-wide text-typography-900 dark:text-typography-0">
              ENABLE MULTI-SELECT
            </Text>
          </HStack>
          <Switch
            value={isMulti}
            onValueChange={setIsMulti}
            size="md"
            trackColor={{
              false: 'rgb(63, 63, 70)',
              true: 'rgb(16, 185, 129)',
            }}
            thumbColor="rgb(255, 255, 255)"
            ios_backgroundColor="rgb(63, 63, 70)"
          />
        </HStack>

        {isMulti ? (
          <VStack space="md" className="w-full">
            {variants.map((v: Variant) => {
              const q = variantQty[v.id] ?? 0;
              const hasQty = q > 0;
              const stock = Math.max(0, v.inventory ?? 0);
              return (
                <SheetQtyRowCard
                  key={v.id}
                  title={v.title ?? ''}
                  unitPrice={v.priceInPKR ?? 0}
                  qty={q}
                  emphasized={hasQty}
                  onDecrement={() => decVariant(v.id)}
                  onIncrement={() => incVariant(v.id, stock)}
                  disableDecrement={q <= 0}
                  disableIncrement={q >= stock}
                />
              );
            })}
          </VStack>
        ) : (
          <>
            <VStack space="md" className="w-full">
              {variants.map((v: Variant) => {
                const selected = v.id === selectedVariant?.id;
                const stock = Math.max(0, v.inventory ?? 0);
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => setSelectedVariantId(v.id)}
                    className={cn(
                      'rounded-2xl border-2 px-4 py-3 active:opacity-95',
                      selected
                        ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-950/20'
                        : 'border-outline-200 bg-background-100 dark:border-outline-300 dark:bg-background-100'
                    )}
                  >
                    <HStack className="items-center gap-3">
                      <Box
                        className={cn(
                          'h-5 w-5 items-center justify-center rounded-full border-2',
                          selected
                            ? 'border-primary-500'
                            : 'border-secondary-400 dark:border-secondary-500'
                        )}
                      >
                        {selected ? (
                          <Box className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                        ) : null}
                      </Box>
                      <Text className="flex-1 text-base font-semibold text-typography-900 dark:text-typography-0">
                        {v.title ?? ''}
                      </Text>
                      <VStack className="items-end">
                        <Text className="text-base font-bold text-typography-900 dark:text-typography-0">
                          {formatRs(v.priceInPKR ?? 0)}
                        </Text>
                        <Text className="text-2xs text-secondary-500 dark:text-typography-400">
                          Stock: {stock}
                        </Text>
                      </VStack>
                    </HStack>
                  </Pressable>
                );
              })}
            </VStack>

            <HStack className="items-center justify-between">
              <Text className={fieldLabelClass}>QUANTITY</Text>
              <HStack className="items-center gap-1 rounded-xl bg-background-100 px-1 py-1 dark:bg-background-100">
                <Pressable
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 items-center justify-center rounded-lg bg-background-200 active:opacity-70 dark:bg-background-200"
                >
                  <Icon
                    as={Minus}
                    size="sm"
                    className="text-typography-700 dark:text-typography-200"
                  />
                </Pressable>
                <Text className="min-w-[32px] text-center text-base font-bold text-typography-900 dark:text-typography-0">
                  {qty}
                </Text>
                <Pressable
                  onPress={() =>
                    setQty((q) =>
                      selectedVariant
                        ? Math.min(
                            Math.max(0, selectedVariant.inventory ?? 0),
                            q + 1
                          )
                        : q + 1
                    )
                  }
                  disabled={
                    !!selectedVariant &&
                    qty >= Math.max(0, selectedVariant.inventory ?? 0)
                  }
                  className={cn(
                    'h-9 w-9 items-center justify-center rounded-lg bg-background-200 active:opacity-70 dark:bg-background-200',
                    !!selectedVariant &&
                      qty >= Math.max(0, selectedVariant.inventory ?? 0) &&
                      'opacity-40'
                  )}
                >
                  <Icon
                    as={Plus}
                    size="sm"
                    className="text-typography-700 dark:text-typography-200"
                  />
                </Pressable>
              </HStack>
            </HStack>
          </>
        )}

        <BottomSheetItem
          closeOnSelect
          onPress={isMulti ? submitMulti : submitSingle}
          disabled={
            isMulti ? !variants.some((v) => (variantQty[v.id] ?? 0) > 0) : false
          }
          className={cn(
            'mt-2 w-full items-center justify-center rounded-full bg-primary-500 py-4 active:opacity-90',
            isMulti &&
              !variants.some((v) => (variantQty[v.id] ?? 0) > 0) &&
              'opacity-40'
          )}
        >
          <Text className="text-label font-bold uppercase tracking-widest text-white">
            ADD TO ORDER •{' '}
            {formatRs(isMulti ? multiLineTotal : lineTotal)}
          </Text>
        </BottomSheetItem>
      </VStack>
    </BottomSheetScrollView>
  );
}
