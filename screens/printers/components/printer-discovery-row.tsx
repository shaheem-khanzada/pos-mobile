import { Printer, Star, Wifi } from 'lucide-react-native';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { variationCardSurfaceClass } from '@/theme/ui';
import type { DiscoveredBlePrinter } from '@/screens/printers/utils/ble-printer';

type PrinterRowProps = {
  device: DiscoveredBlePrinter;
  isDefault: boolean;
  onSelect: (device: DiscoveredBlePrinter) => void;
};

export function PrinterDiscoveryRow({
  device,
  isDefault,
  onSelect,
}: PrinterRowProps) {
  const kindLabel = device.name.toLowerCase().includes('label')
    ? 'LABEL PRINTER'
    : 'RECEIPT PRINTER';

  return (
    <Pressable
      onPress={() => onSelect(device)}
      className={cn('active:opacity-90')}
    >
      <VStack
        className={cn(
          'rounded-[30px] border border-[#232933] px-4 py-4',
          'bg-[#101317] dark:bg-[#101317]',
          variationCardSurfaceClass,
          isDefault && 'border-[#2B4B43]'
        )}
      >
        <HStack className="items-center gap-3">
          <HStack className="min-w-0 flex-1 items-center gap-4">
            <Box className="relative h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1B2129]">
              {isDefault ? (
                <Box className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
              ) : null}
              <Icon
                as={Printer}
                size="lg"
                className={cn(isDefault ? 'text-emerald-400' : 'text-[#7E8798]')}
              />
            </Box>

            <VStack className="min-w-0 flex-1 gap-2">
              <HStack className="items-center gap-2">
                <Text
                  numberOfLines={1}
                  className="flex-1 text-[20px] font-extrabold leading-tight tracking-tight text-white"
                >
                  {device.name}
                </Text>
                {isDefault ? (
                  <HStack className="items-center gap-1.5 rounded-full bg-[#0F4035] px-2.5 py-1">
                    <Icon as={Star} size="xs" className="text-emerald-400" />
                    <Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-emerald-300">
                      Default
                    </Text>
                  </HStack>
                ) : null}
              </HStack>
              <HStack className="items-center gap-2">
                <Icon as={Wifi} size="xs" className="text-[#667084]" />
                <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#667084]">
                  Bluetooth • {kindLabel}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {!isDefault ? (
            <Pressable
              onPress={() => onSelect(device)}
              className="rounded-[18px] border border-[#252C36] bg-[#0C0F14] px-5 py-3 active:opacity-80"
            >
              <Text className="text-[12px] font-extrabold uppercase tracking-[2px] text-white">
                Set Default
              </Text>
            </Pressable>
          ) : (
            <Box className="w-[128px]" />
          )}
        </HStack>
      </VStack>
    </Pressable>
  );
}
