import { Minus, Plus } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type QtyStepperProps = {
  qty: number;
  onDecrement: () => void;
  onIncrement: () => void;
  disableDecrement?: boolean;
  disableIncrement?: boolean;
};

/** Shared quantity stepper used across order/cart bottom-sheet UIs. */
export function QtyStepper({
  qty,
  onDecrement,
  onIncrement,
  disableDecrement = false,
  disableIncrement = false,
}: QtyStepperProps) {
  return (
    <HStack className="shrink-0 items-center gap-0.5 rounded-lg bg-background-200/80 px-0.5 py-0.5 dark:bg-[#1b1b1c]">
      <Pressable
        onPress={onDecrement}
        disabled={disableDecrement}
        className={`h-9 w-9 items-center justify-center rounded-md bg-background-300 active:opacity-70 dark:bg-background-300 ${
          disableDecrement ? 'opacity-40' : ''
        }`}
      >
        <Icon
          as={Minus}
          size="sm"
          className="text-typography-900 dark:text-typography-0"
        />
      </Pressable>
      <Text className="min-w-[32px] text-center text-base font-bold text-typography-900 dark:text-typography-0">
        {qty}
      </Text>
      <Pressable
        onPress={onIncrement}
        disabled={disableIncrement}
        className={`h-9 w-9 items-center justify-center rounded-md bg-primary-500 active:opacity-90 ${
          disableIncrement ? 'opacity-40' : ''
        }`}
      >
        <Icon as={Plus} size="sm" className="text-white" />
      </Pressable>
    </HStack>
  );
}
