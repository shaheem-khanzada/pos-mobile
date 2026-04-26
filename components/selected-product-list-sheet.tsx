import {
  Layers,
  Package,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react-native';
import { QtyStepper } from '@/components/orders/qty-stepper';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import {
  BottomSheetItem,
  BottomSheetScrollView,
} from '@/components/ui/bottomsheet';
import { cn } from '@/lib/cn';
import { formatRs } from '@/lib/format-rs';
import { variationCardSurfaceClass } from '@/theme/ui';
import type { CartItem } from '@/payload/types';
import {
  cartItemListKey,
  cartItemUnitPrice,
} from '@/screens/orders/types';


function variantRowLabel(line: CartItem): string {
  return line.variant?.title?.trim() || line.product.title;
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
}: SelectedProductListSheetContentProps) {
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
              className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-100 p-0 active:opacity-80 dark:bg-[#1b1b1c]"
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
              {cartItems.map((line) => (
                <SingleItemCard
                  key={cartItemListKey(line)}
                  line={line}
                  onAdjustCartItemQty={onAdjustCartItemQty}
                  onRemoveCartItem={onRemoveCartItem}
                />
              ))}
            </VStack>
          )}
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
        <QtyStepper
          qty={line.quantity}
          onDecrement={() => onAdjustCartItemQty(line.id, -1)}
          onIncrement={() => onAdjustCartItemQty(line.id, 1)}
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

