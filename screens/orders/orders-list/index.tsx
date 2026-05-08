import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Moon, Plus, Search, Sun } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { withObservables } from '@nozbe/watermelondb/react';

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
import { fetchOrdersObservable } from '@/database';
import type Order from '@/database/model/Order';
import { fieldLabelClass, standardInputClass } from '@/theme/ui';
import { useReceiptPrinter } from '@/screens/printers/hooks/use-receipt-printer';
import { buildReceiptCartFromOrder } from '@/screens/printers/utils/build-receipt-cart-from-order';
import { setToast } from '@/toast/store';
import { OrderListItem } from '@/screens/orders/components/orders-list/order-list-item';
import {
  countOrdersCreatedToday,
  mapOrderModelToOrderListItem,
} from './map-cart-to-order-list-item';
import type { OrderListItem as OrderListEntry } from './types';

const ORDERS_PAGE_LIMIT = 100;

type OrdersListShellProps = {
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
};

type OrdersListBodyProps = OrdersListShellProps & {
  orders: Order[];
};

function OrdersListBody({ orders, searchText, setSearchText }: OrdersListBodyProps) {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const { printCart, printingKey } = useReceiptPrinter();

  const ordersMapped = useMemo(
    () => orders.map((row) => mapOrderModelToOrderListItem(row)),
    [orders]
  );

  const newOrdersToday = useMemo(() => countOrdersCreatedToday(orders), [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return ordersMapped;
    return ordersMapped.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
    );
  }, [ordersMapped, searchText]);

  const count = filteredOrders.length;

  const handlePrint = useCallback(
    async (orderRow: OrderListEntry) => {
      const row = orders.find((o) => o.id === orderRow.id);
      if (!row) {
        setToast({
          variant: 'warning',
          title: 'Print',
          description: 'Order is no longer available locally.',
        });
        return;
      }
      try {
        const cart = await buildReceiptCartFromOrder(row);
        await printCart(cart, orderRow.id);
      } catch {
        setToast({
          variant: 'error',
          title: 'Print failed',
          description: 'Could not load order lines for printing.',
        });
      }
    },
    [orders, printCart]
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
              <InputIcon as={Search} size="md" className="text-secondary-400" />
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
          </Box>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}

const ObservedOrdersListBody = withObservables([], () => ({
  orders: fetchOrdersObservable(),
}))(OrdersListBody);

export function OrdersListScreen() {
  const [searchText, setSearchText] = useState('');
  return (
    <ObservedOrdersListBody searchText={searchText} setSearchText={setSearchText} />
  );
}
