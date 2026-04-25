import { Minus, Package, Plus, Trash2 } from 'lucide-react-native';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
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
        'items-center gap-3 border-b border-outline-200 py-4',
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

      <HStack className="shrink-0 items-center gap-1 rounded-xl bg-background-100 px-1 py-1 dark:bg-background-100">
        <Pressable
          onPress={() =>
            onChangeQty(line.id, Math.max(1, line.quantity - 1))
          }
          className="h-8 w-8 items-center justify-center rounded-lg active:opacity-70"
        >
          <Icon
            as={Minus}
            size="sm"
            className="text-typography-700 dark:text-typography-200"
          />
        </Pressable>
        <Text className="min-w-[28px] text-center text-sm font-bold text-typography-900 dark:text-typography-0">
          {line.quantity}
        </Text>
        <Pressable
          onPress={() => onChangeQty(line.id, line.quantity + 1)}
          className="h-8 w-8 items-center justify-center rounded-lg active:opacity-70"
        >
          <Icon
            as={Plus}
            size="sm"
            className="text-typography-700 dark:text-typography-200"
          />
        </Pressable>
      </HStack>

      <Pressable
        onPress={() => onRemove(line.id)}
        className="h-10 w-10 shrink-0 items-center justify-center rounded-xl active:opacity-70"
      >
        <Icon as={Trash2} size="md" className="text-error-500" />
      </Pressable>
    </HStack>
  );
}
