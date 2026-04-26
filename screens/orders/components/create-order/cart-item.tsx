import { Package, Trash2 } from 'lucide-react-native';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { QtyStepper } from '@/components/orders/qty-stepper';
import { cn } from '@/lib/cn';
import { formatRs } from '@/lib/format-rs';
import type { CartItem } from '@/payload/types';
import { cartItemTitle, cartItemUnitPrice } from '@/screens/orders/types';

type CartItemRowProps = {
  line: CartItem;
  isLast?: boolean;
  onChangeQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
};

export function CartItemRow({
  line,
  isLast,
  onChangeQty,
  onRemove,
}: CartItemRowProps) {
  const unit = cartItemUnitPrice(line);
  return (
    <HStack
      className={cn(
        'items-center gap-3 border-b border-outline-100 py-4',
        isLast && 'border-b-0'
      )}
    >
      <Box
        className={cn(
          'h-12 w-12 shrink-0 items-center justify-center rounded-lg',
          'bg-background-100 dark:bg-background-100'
        )}
      >
        <Icon
          as={Package}
          size="md"
          className="text-secondary-500 dark:text-secondary-400"
        />
      </Box>

      <VStack className="min-w-0 flex-1 gap-0.5">
        <Text
          className="text-base font-bold text-typography-900 dark:text-typography-0"
          numberOfLines={2}
        >
          {cartItemTitle(line)}
        </Text>
        <Text className="text-sm text-secondary-500 dark:text-typography-400">
          {formatRs(unit)} × {line.quantity}
        </Text>
      </VStack>

      <QtyStepper
        qty={line.quantity}
        onDecrement={() => onChangeQty(line.id, Math.max(1, line.quantity - 1))}
        onIncrement={() => onChangeQty(line.id, line.quantity + 1)}
        disableDecrement={line.quantity <= 1}
      />

      <Pressable
        onPress={() => onRemove(line.id)}
        className="h-10 w-10 shrink-0 items-center justify-center rounded-xl active:opacity-70"
      >
        <Icon as={Trash2} size="md" className="text-error-500" />
      </Pressable>
    </HStack>
  );
}
