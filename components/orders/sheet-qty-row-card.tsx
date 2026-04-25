import { Minus, Plus } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { formatRs } from '@/lib/format-rs';

export type SheetQtyRowCardProps = {
  title: string;
  unitPrice: number;
  qty: number;
  /** Primary border + surface when true (e.g. multi-variant row with qty above zero). */
  emphasized: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
  disableDecrement?: boolean;
  disableIncrement?: boolean;
};

/**
 * Shared “multi-variant” bottom sheet row: bordered card, title, unit price, − / qty / +.
 */
export function SheetQtyRowCard({
  title,
  unitPrice,
  qty,
  emphasized,
  onDecrement,
  onIncrement,
  disableDecrement = false,
  disableIncrement = false,
}: SheetQtyRowCardProps) {
  return (
    <HStack
      className={cn(
        'w-full items-center justify-between rounded-2xl border-2 px-4 py-3',
        emphasized
          ? 'border-primary-500 bg-background-100 dark:bg-background-100'
          : 'border-outline-200 bg-background-100 dark:border-outline-300 dark:bg-background-100'
      )}
    >
      <VStack className="min-w-0 flex-1 pr-3">
        <Text className="text-base font-bold text-typography-900 dark:text-typography-0">
          {title}
        </Text>
        <Text className="text-sm font-semibold text-primary-500">
          {formatRs(unitPrice)}
        </Text>
      </VStack>
      <HStack className="shrink-0 items-center gap-0.5 rounded-lg bg-background-200/80 px-0.5 py-0.5 dark:bg-background-200">
        <Pressable
          onPress={onDecrement}
          disabled={disableDecrement}
          className={cn(
            'h-9 w-9 items-center justify-center rounded-md bg-background-300 active:opacity-70 dark:bg-background-300',
            disableDecrement && 'opacity-40'
          )}
        >
          <Icon
            as={Minus}
            size="sm"
            className="text-typography-900 dark:text-typography-0"
          />
        </Pressable>
        <Text className="min-w-[28px] text-center text-sm font-bold text-typography-900 dark:text-typography-0">
          {qty}
        </Text>
        <Pressable
          onPress={onIncrement}
          disabled={disableIncrement}
          className={cn(
            'h-9 w-9 items-center justify-center rounded-md bg-primary-500 active:opacity-90',
            disableIncrement && 'opacity-40'
          )}
        >
          <Icon as={Plus} size="sm" className="text-white" />
        </Pressable>
      </HStack>
    </HStack>
  );
}
