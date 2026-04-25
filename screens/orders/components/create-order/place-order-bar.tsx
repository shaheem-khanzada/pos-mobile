import { ArrowRight, ShoppingCart } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';

function formatRs(price: number) {
  const n = Number.isFinite(price) ? price : 0;
  return `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
}

type PlaceOrderBarProps = {
  total: number;
  /** Number shown on the cart badge (e.g. line count or total units) */
  cartBadgeCount: number;
  onViewItems: () => void;
  onConfirm: () => void;
  /** Right pill label — default CONFIRM */
  confirmLabel?: string;
  className?: string;
  confirmDisabled?: boolean;
  isConfirmLoading?: boolean;
};

export function PlaceOrderBar({
  total,
  cartBadgeCount,
  onViewItems,
  onConfirm,
  confirmLabel = 'CONFIRM',
  className,
  confirmDisabled = false,
  isConfirmLoading = false,
}: PlaceOrderBarProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const badge =
    cartBadgeCount > 99 ? '99+' : String(Math.max(0, cartBadgeCount));

  return (
    <HStack
      className={cn(
        'items-center justify-between gap-3 rounded-full border px-3 py-2.5',
        isDark
          ? 'border-outline-200 bg-secondary-100'
          : 'border-outline-200 bg-app-surface',
        className
      )}
    >
      <Pressable
        onPress={onViewItems}
        className="min-w-0 flex-1 flex-row items-center gap-3 active:opacity-90"
      >
        <Box className="relative">
          <Icon
            as={ShoppingCart}
            size="xl"
            className="text-primary-500"
          />
          <Box className="absolute -right-0.5 -top-0.5 min-h-[14px] min-w-[14px] items-center justify-center rounded-full bg-primary-500 px-0.5">
            <Text className="text-[8px] font-bold leading-none text-white">
              {badge}
            </Text>
          </Box>
        </Box>
        <VStack className="min-w-0 flex-1">
          <Text
            className={cn(
              'text-base font-bold',
              isDark ? 'text-typography-0' : 'text-typography-900'
            )}
          >
            {formatRs(total)}
          </Text>
          <Text
            className={cn(
              'text-xs font-medium',
              isDark ? 'text-secondary-400' : 'text-secondary-500'
            )}
          >
            View Items
          </Text>
        </VStack>
      </Pressable>

      <Pressable
        onPress={onConfirm}
        disabled={confirmDisabled || isConfirmLoading}
        className={cn(
          'flex-row items-center gap-2 rounded-full bg-primary-500 px-5 py-3',
          confirmDisabled || isConfirmLoading ? 'opacity-50' : 'active:opacity-90'
        )}
      >
        <Text className="text-label font-bold uppercase tracking-widest text-white">
          {isConfirmLoading ? '…' : confirmLabel}
        </Text>
        {!isConfirmLoading ? (
          <Icon as={ArrowRight} size="sm" className="text-white" />
        ) : null}
      </Pressable>
    </HStack>
  );
}

