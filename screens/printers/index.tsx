import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { FlatList } from '@/components/ui/flat-list';
import { cn } from '@/lib/cn';
import { fieldLabelClass } from '@/theme/ui';
import { usePrinterStore } from '@/screens/printers/store';
import type { DiscoveredBlePrinter } from '@/screens/printers/utils/ble-printer';
import { useBlePrinterDiscovery } from '@/screens/printers/hooks/use-ble-printer-discovery';
import { PrinterDiscoveryRow } from '@/screens/printers/components/printer-discovery-row';

export function PrintersScreen() {
  const router = useRouter();
  const { printers, isScanning, scanError, scan } = useBlePrinterDiscovery();
  const defaultPrinter = usePrinterStore((s) => s.defaultPrinter);
  const setDefaultPrinter = usePrinterStore((s) => s.setDefaultPrinter);

  const onScan = useCallback(() => {
    void scan(9000);
  }, [scan]);

  useEffect(() => {
    onScan();
  }, [onScan]);

  const onSelectDevice = useCallback(
    (device: DiscoveredBlePrinter) => {
      setDefaultPrinter({
        id: device.id,
        name: device.name,
        connection: 'ble',
      });
    },
    [setDefaultPrinter]
  );

  const onClearDefault = useCallback(() => {
    setDefaultPrinter(null);
  }, [setDefaultPrinter]);

  return (
    <SafeAreaView className="flex-1 bg-app-page" edges={['top', 'left', 'right']}>
      <VStack className="flex-1 px-5 pt-4">
        <HStack className="items-center justify-between pb-6">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80"
          >
            <Icon as={ArrowLeft} size="lg" className="text-typography-900 dark:text-typography-0" />
          </Pressable>
          <VStack className="min-w-0 flex-1 items-center px-2">
            <Text className="text-center text-xl font-bold text-typography-900 dark:text-typography-0">
              Printers
            </Text>
            <Text className="mt-1 text-center text-2xs font-bold uppercase tracking-widest text-primary-500">
              {isScanning ? '• SCANNING PRINTERS…' : '• BLUETOOTH RECEIPT PRINTERS'}
            </Text>
          </VStack>
          <Pressable
            onPress={onScan}
            disabled={isScanning}
            className={cn(
              'h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80',
              isScanning && 'opacity-50'
            )}
          >
            <Icon
              as={RefreshCw}
              size="md"
              className={cn('text-emerald-500', isScanning && 'opacity-70')}
            />
          </Pressable>
        </HStack>

        {scanError ? (
          <Box className="mb-4 rounded-2xl border border-error-300 bg-error-50 px-4 py-3 dark:border-error-800 dark:bg-error-950/40">
            <Text className="text-sm text-error-700 dark:text-error-200">
              {scanError}
            </Text>
          </Box>
        ) : null}

        <VStack space="xs" className="flex-1">
          <HStack className="items-center justify-between">
            <Text className={fieldLabelClass}>Available printers</Text>
            {defaultPrinter ? (
              <Pressable
                onPress={onClearDefault}
                className="rounded-full border border-[#2A313D] bg-[#0F1319] px-3 py-1.5 active:opacity-80"
              >
                <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#A4AFC0]">
                  Clear default
                </Text>
              </Pressable>
            ) : null}
          </HStack>
          <Text className="text-xs text-secondary-500 dark:text-typography-400">
            Make sure the printer is ON and discoverable in Bluetooth settings, then scan.
          </Text>
          <Box className="min-h-[120px] flex-1">
            <FlatList
              data={printers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Box
                  className={cn(
                    'rounded-2xl border border-outline-100 bg-background-0 p-4',
                    'dark:border-outline-800 dark:bg-background-50'
                  )}
                >
                  <Text className="text-center text-sm text-typography-500 dark:text-typography-400">
                    No printers found. Tap refresh to scan again.
                  </Text>
                </Box>
              }
              renderItem={({ item }) => (
                <PrinterDiscoveryRow
                  device={item}
                  isDefault={defaultPrinter?.id === item.id}
                  onSelect={onSelectDevice}
                />
              )}
            />
          </Box>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
