import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { QtyStepper } from '@/components/orders/qty-stepper';
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
          ? 'border-primary-500 bg-primary-500/5'
            : 'border-outline-100 dark:border-outline-100'
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
      <QtyStepper
        qty={qty}
        onDecrement={onDecrement}
        onIncrement={onIncrement}
        disableDecrement={disableDecrement}
        disableIncrement={disableIncrement}
      />
    </HStack>
  );
}
