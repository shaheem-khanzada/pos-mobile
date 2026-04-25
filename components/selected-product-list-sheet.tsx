import { useCallback, useMemo } from 'react';
import {
  ArrowRight,
  Layers,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Badge, BadgeText } from '@/components/ui/badge';
import {
  BottomSheetItem,
  BottomSheetScrollView,
  useBottomSheetContext,
} from '@/components/ui/bottomsheet';
import { cn } from '@/lib/cn';
import { formatRs } from '@/lib/format-rs';
import { fieldLabelClass, variationCardSurfaceClass } from '@/theme/ui';
import type { CartItem } from '@/payload/types';
import {
  cartItemListKey,
  cartItemUnitPrice,
} from '@/screens/orders/types';

function formatPkrAmount(price: number) {
  const n = Number.isFinite(price) ? price : 0;
  return Math.round(n).toLocaleString('en-PK');
}

/** Product title for a grouped variant block. */
function productGroupTitle(lines: CartItem[]): string {
  return lines[0]?.product.title ?? '';
}

function variantRowLabel(line: CartItem): string {
  return line.variant?.title?.trim() || line.product.title;
}

type DisplayBlock =
  | { type: 'single'; line: CartItem }
  | { type: 'group'; productId: string; lines: CartItem[] };

function buildDisplayBlocks(cartLines: CartItem[]): DisplayBlock[] {
  const emittedProduct = new Set<string>();
  const blocks: DisplayBlock[] = [];

  for (const line of cartLines) {
    if (!line.variant) {
      blocks.push({ type: 'single', line });
      continue;
    }
    const pid = line.product.id;
    if (emittedProduct.has(pid)) continue;
    emittedProduct.add(pid);
    blocks.push({
      type: 'group',
      productId: pid,
      lines: cartLines.filter((l) => l.variant && l.product.id === pid),
    });
  }

  return blocks;
}

export type SelectedProductListSheetContentProps = {
  cartItems: CartItem[];
  totalUnits: number;
  subtotal: number;
  onAdjustCartItemQty: (cartItemId: string, delta: number) => void;
  onRemoveCartItem: (cartItemId: string) => void;
  onClearAll: () => void;
};

/**
 * “Your selection” cart review for the Gluestack bottom sheet portal.
 */
export function SelectedProductListSheetContent({
  cartItems,
  totalUnits,
  subtotal,
  onAdjustCartItemQty,
  onRemoveCartItem,
  onClearAll,
}: SelectedProductListSheetContentProps) {
  const { handleClose } = useBottomSheetContext();

  const blocks = useMemo(() => buildDisplayBlocks(cartItems), [cartItems]);

  const onContinue = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <VStack className="flex-1 bg-app-surface">
      <BottomSheetScrollView
        className="flex-1 bg-app-surface"
        contentContainerClassName="px-5 pb-4 pt-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <VStack space="lg" className="w-full">
          <HStack className="items-start justify-between gap-3">
            <Box className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background-200 dark:bg-background-100">
              <Icon as={ShoppingCart} size="lg" className="text-primary-500" />
            </Box>
            <VStack space="xs" className="min-w-0 flex-1">
              <Text className="text-xl font-bold text-typography-900 dark:text-typography-0">
                Your Selection
              </Text>
              <Text className="text-xs font-medium uppercase tracking-wide text-secondary-500 dark:text-typography-400">
                {totalUnits} total units • {formatRs(subtotal)}
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

          {cartItems.length === 0 ? (
            <Text className="py-8 text-center text-sm text-secondary-500 dark:text-typography-400">
              No products in your selection yet.
            </Text>
          ) : (
            <VStack space="md" className="w-full">
              {blocks.map((block) => {
                if (block.type === 'single') {
                  return (
                    <SingleItemCard
                      key={cartItemListKey(block.line)}
                      line={block.line}
                      onAdjustCartItemQty={onAdjustCartItemQty}
                      onRemoveCartItem={onRemoveCartItem}
                    />
                  );
                }
                const title = productGroupTitle(block.lines);
                return (
                  <GroupedItemsCard
                    key={block.productId}
                    groupTitle={title}
                    lines={block.lines}
                    onAdjustCartItemQty={onAdjustCartItemQty}
                    onRemoveCartItem={onRemoveCartItem}
                  />
                );
              })}
            </VStack>
          )}
        </VStack>
        <VStack
        space="sm"
        className="border-t border-outline-200 bg-app-surface px-5 pb-5 pt-3 dark:border-outline-300"
      >
        <HStack className="items-end justify-between gap-4">
          <Pressable
            onPress={onClearAll}
            disabled={cartItems.length === 0}
            className={cn(
              'items-center rounded-xl border-2 border-error-500 px-3 py-2 active:opacity-80',
              cartItems.length === 0 && 'opacity-40'
            )}
          >
            <Icon as={Trash2} size="md" className="text-error-500" />
            <Text className="mt-1 text-2xs font-bold uppercase text-error-500">
              Clear all
            </Text>
          </Pressable>

          <VStack className="items-end">
            <Text className={fieldLabelClass}>Total bill</Text>
            <HStack className="items-baseline gap-1">
              <Text className="text-sm font-medium text-secondary-500 dark:text-typography-400">
                PKR
              </Text>
              <Text className="text-2xl font-bold text-primary-500">
                {formatPkrAmount(subtotal)}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <BottomSheetItem
          closeOnSelect
          onPress={onContinue}
          className="w-full flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-3.5 active:opacity-90"
        >
          <Text className="text-label font-bold uppercase tracking-widest text-white">
            Continue picking products
          </Text>
          <Icon as={ArrowRight} size="sm" className="text-white" />
        </BottomSheetItem>
      </VStack>
      </BottomSheetScrollView>
    </VStack>
  );
}

function SingleItemCard({
  line,
  onAdjustCartItemQty,
  onRemoveCartItem,
}: {
  line: CartItem;
  onAdjustCartItemQty: (cartItemId: string, delta: number) => void;
  onRemoveCartItem: (cartItemId: string) => void;
}) {
  const isVariant = Boolean(line.variant);
  return (
    <VStack
      className={cn('overflow-hidden rounded-2xl p-4', variationCardSurfaceClass)}
    >
      <HStack className="items-center gap-3">
        <Box className="h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background-100 dark:bg-background-100">
          <Icon
            as={isVariant ? Layers : Package}
            size="md"
            className="text-secondary-500 dark:text-secondary-400"
          />
        </Box>
        <VStack className="min-w-0 flex-1 gap-0.5">
          <Text
            className="text-base font-bold text-typography-900 dark:text-typography-0"
            numberOfLines={2}
          >
            {isVariant ? variantRowLabel(line) : line.product.title}
          </Text>
          <Text className="text-sm font-semibold text-primary-500">
            {formatRs(cartItemUnitPrice(line))}
          </Text>
        </VStack>
        <ItemStepper
          qty={line.quantity}
          onMinus={() => onAdjustCartItemQty(line.id, -1)}
          onPlus={() => onAdjustCartItemQty(line.id, 1)}
        />
        <Pressable
          onPress={() => onRemoveCartItem(line.id)}
          hitSlop={8}
          className="h-10 w-10 shrink-0 items-center justify-center rounded-xl active:opacity-70"
        >
          <Icon as={Trash2} size="md" className="text-error-500" />
        </Pressable>
      </HStack>
    </VStack>
  );
}

function GroupedItemsCard({
  groupTitle,
  lines,
  onAdjustCartItemQty,
  onRemoveCartItem,
}: {
  groupTitle: string;
  lines: CartItem[];
  onAdjustCartItemQty: (cartItemId: string, delta: number) => void;
  onRemoveCartItem: (cartItemId: string) => void;
}) {
  const header = (groupTitle.trim() || lines[0]?.product.title) ?? '';
  return (
    <VStack
      className={cn('overflow-hidden rounded-2xl p-4', variationCardSurfaceClass)}
    >
      <HStack className="mb-3 items-center gap-2">
        <Icon as={Package} size="sm" className="text-primary-500" />
        <Text
          className="flex-1 text-xs font-bold uppercase tracking-wide text-typography-900 dark:text-typography-0"
          numberOfLines={1}
        >
          {header}
        </Text>
        <Badge
          action="success"
          variant="outline"
          size="sm"
          className="rounded-full border-primary-500 bg-primary-500/10 px-2 py-0.5"
        >
          <BadgeText className="text-2xs font-bold uppercase text-primary-600 dark:text-primary-400">
            {lines.length} variants
          </BadgeText>
        </Badge>
      </HStack>
      <VStack className="gap-3">
        {lines.map((line, i) => (
          <HStack
            key={cartItemListKey(line)}
            className={cn(
              'items-center gap-3',
              i > 0 &&
                'border-t border-outline-100 pt-3 dark:border-outline-200'
            )}
          >
            <Box className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background-100 dark:bg-background-100">
              <Icon
                as={Layers}
                size="sm"
                className="text-secondary-500 dark:text-secondary-400"
              />
            </Box>
            <VStack className="min-w-0 flex-1 gap-0.5">
              <Text className="text-sm font-bold text-typography-900 dark:text-typography-0">
                {variantRowLabel(line)}
              </Text>
              <Text className="text-xs font-semibold text-primary-500">
                {formatRs(cartItemUnitPrice(line))}
              </Text>
            </VStack>
            <ItemStepper
              qty={line.quantity}
              onMinus={() => onAdjustCartItemQty(line.id, -1)}
              onPlus={() => onAdjustCartItemQty(line.id, 1)}
            />
            <Pressable
              onPress={() => onRemoveCartItem(line.id)}
              hitSlop={8}
              className="h-10 w-10 shrink-0 items-center justify-center rounded-xl active:opacity-70"
            >
              <Icon as={Trash2} size="md" className="text-error-500" />
            </Pressable>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

function ItemStepper({
  qty,
  onMinus,
  onPlus,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <HStack className="shrink-0 items-center gap-0.5 rounded-full bg-background-100 px-0.5 py-0.5 dark:bg-background-100">
      <Pressable
        onPress={onMinus}
        className="h-8 w-8 items-center justify-center rounded-full bg-background-200 active:opacity-70 dark:bg-background-200"
      >
        <Icon
          as={Minus}
          size="sm"
          className="text-typography-700 dark:text-typography-200"
        />
      </Pressable>
      <Text className="min-w-[24px] text-center text-sm font-bold text-typography-900 dark:text-typography-0">
        {qty}
      </Text>
      <Pressable
        onPress={onPlus}
        className="h-8 w-8 items-center justify-center rounded-full bg-primary-500 active:opacity-90"
      >
        <Icon as={Plus} size="sm" className="text-white" />
      </Pressable>
    </HStack>
  );
}
