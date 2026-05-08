import { Printer } from 'lucide-react-native';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';
import { variationCardSurfaceClass } from '@/theme/ui';

export type PrinterNearbyDeviceRowProps = {
  name: string;
  /** Shown below the name (e.g. Printer · Mobile). */
  deviceType: string;
  connectLabel?: string;
  onConnect?: () => void;
  /** Highlights row when this device is the saved default. */
  isDefault?: boolean;
  /** Disable the action (e.g. already default). */
  connectDisabled?: boolean;
};

/**
 * Compact row: printer icon, name + device type, connect action — aligned with POS list cards.
 */
export function PrinterNearbyDeviceRow({
  name,
  deviceType,
  connectLabel = 'Connect',
  onConnect,
  isDefault = false,
  connectDisabled = false,
}: PrinterNearbyDeviceRowProps) {
  const actionBlocked = connectDisabled || !onConnect;

  return (
    <HStack
      className={cn(
        'items-center justify-between gap-3 px-4 py-3',
        variationCardSurfaceClass,
        isDefault && 'border-primary-500/40 dark:border-primary-500/35'
      )}
    >
      <HStack className="min-w-0 flex-1 items-center gap-3">
        <Box className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background-100 dark:bg-background-200">
          <Icon as={Printer} size="lg" className="text-primary-500" />
        </Box>
        <VStack className="min-w-0 flex-1 gap-0.5">
          <Text
            numberOfLines={1}
            className="text-base font-bold text-typography-900 dark:text-typography-0"
          >
            {name}
          </Text>
          <Text
            numberOfLines={1}
            className="text-xs font-medium uppercase tracking-wide text-secondary-500 dark:text-typography-400"
          >
            {deviceType}
          </Text>
        </VStack>
      </HStack>
      <Pressable
        onPress={onConnect}
        disabled={actionBlocked}
        className={cn(
          'shrink-0 rounded-xl px-4 py-2.5',
          actionBlocked
            ? 'border border-primary-500/25 bg-primary-500/10'
            : 'bg-background-100 active:opacity-80 dark:bg-background-200'
        )}
      >
        <Text
          className={cn(
            'text-xs font-bold',
            actionBlocked
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-typography-900 dark:text-typography-0'
          )}
        >
          {connectLabel}
        </Text>
      </Pressable>
    </HStack>
  );
}
