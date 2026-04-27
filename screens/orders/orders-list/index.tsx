import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Moon, Plus, Search, Sun } from 'lucide-react-native';
import { FlatList } from '@/components/ui/flat-list';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';
import { useActiveCartsTodayCountQuery, useCartsListQuery } from '@/hooks/use-carts-queries';
import { fieldLabelClass, standardInputClass } from '@/theme/ui';
import { useReceiptPrinter } from '@/screens/printers/hooks/use-receipt-printer';
import { setToast } from '@/toast/store';
import { OrderListItem } from '@/screens/orders/components/orders-list/order-list-item';
import { mapCartToOrderListItem } from './map-cart-to-order-list-item';
import type { OrderListItem as OrderListEntry } from './types';

export function OrdersListScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [searchText, setSearchText] = useState('');
  const { printCart, printingKey } = useReceiptPrinter();
  const cartsQuery = useCartsListQuery({ limit: 30, sort: '-createdAt' });
  const carts = cartsQuery.data;
  const activeTodayCountQuery = useActiveCartsTodayCountQuery();

  const orders = useMemo(
    () => carts?.map((cart) => mapCartToOrderListItem(cart)) ?? [],
    [carts]
  );

  const newOrdersToday = activeTodayCountQuery.data ?? 0;

  const filteredOrders = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
    );
  }, [orders, searchText]);

  const count = filteredOrders.length;

  const handlePrint = useCallback(
    async (order: OrderListEntry) => {
      const cart = carts?.find((c) => c.id === order.id);
      if (!cart) {
        setToast({
          variant: 'warning',
          title: 'Print',
          description: 'Order data is not available. Pull to refresh and try again.',
        });
        return;
      }
      await printCart(cart, order.id);
    },
    [carts, printCart]
  );

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <SafeAreaView
      className="flex-1 bg-app-page"
      edges={['top', 'left', 'right', 'bottom']}
    >
      <VStack className="flex-1 px-5 pt-4">
        <HStack className="items-start justify-between pb-6">
          <Pressable
            onPress={toggleColorScheme}
            className="h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80"
          >
            <Icon
              as={colorScheme === 'dark' ? Sun : Moon}
              className="text-emerald-500"
              size="md"
            />
          </Pressable>

          <VStack className="min-w-0 flex-1 items-center px-2">
            <Text className="text-center text-xl font-bold text-typography-900 dark:text-typography-0">
              Orders
            </Text>
            <Text className="mt-1 text-center text-2xs font-bold uppercase tracking-widest text-primary-500">
              • {newOrdersToday} NEW ORDERS TODAY
            </Text>
          </VStack>

          <Pressable
            onPress={() => router.push('/tabs/create-order')}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 active:opacity-90"
          >
            <Icon as={Plus} size="md" className="text-emerald-500" />
          </Pressable>
        </HStack>

        <VStack className="flex-1" space="md">
          <Input
            size="lg"
            variant="outline"
            className={cn(standardInputClass, 'border-0 pl-0')}
          >
            <InputSlot className="justify-center pl-4 pr-2">
              <InputIcon
                as={Search}
                size="md"
                className="text-secondary-400"
              />
            </InputSlot>
            <InputField
              className="px-0 pr-4 text-sm text-typography-900 placeholder:text-typography-500 dark:text-typography-0"
              placeholder="Search by ID or customer..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </Input>

          <HStack className="items-center justify-between px-0.5">
            <Text className={fieldLabelClass}>All orders</Text>
            <Box className="rounded-full bg-background-100 px-2.5 py-1 dark:bg-background-100">
              <Text className="text-2xs font-semibold text-typography-600 dark:text-typography-400">
                {count} {count === 1 ? 'Order' : 'Orders'}
              </Text>
            </Box>
          </HStack>

          <Box className="flex-1">
            {cartsQuery.isPending ? (
              <VStack className="flex-1 items-center justify-center gap-3">
                <ActivityIndicator size="small" />
                <Text className="text-sm text-typography-500">Loading orders...</Text>
              </VStack>
            ) : (
              <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  gap: 12,
                  paddingBottom: 24,
                }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <OrderListItem
                    order={item}
                    onPrint={handlePrint}
                    isPrinting={printingKey === item.id}
                  />
                )}
                ListEmptyComponent={
                <Card
                  className={cn(
                    'rounded-2xl border border-outline-100 bg-background-0 p-4',
                    'dark:border-outline-800 dark:bg-background-50'
                  )}
                >
                  <Text className="text-center text-sm text-typography-500">
                    {searchText.trim()
                      ? `No orders match "${searchText.trim()}".`
                      : 'No orders yet.'}
                  </Text>
                </Card>
                }
              />
            )}
          </Box>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
