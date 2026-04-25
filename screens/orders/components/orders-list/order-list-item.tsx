import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Badge, BadgeText } from '@/components/ui/badge';
import { CircleDollarSign, Clock, Printer } from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { fieldLabelClass, variationCardSurfaceClass } from '@/theme/ui';
import type { OrderListItem, OrderStatus } from '@/screens/orders/orders-list/types';

function formatRs(price: number) {
  const n = Number.isFinite(price) ? price : 0;
  return `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
}

const statusBadgeAction: Record<
  OrderStatus,
  'success' | 'warning' | 'error'
> = {
  completed: 'success',
  pending: 'warning',
  cancelled: 'error',
};

const statusLabel: Record<OrderStatus, string> = {
  completed: 'COMPLETED',
  pending: 'PENDING',
  cancelled: 'CANCELLED',
};

const statusDotClass: Record<OrderStatus, string> = {
  completed: 'bg-emerald-500',
  pending: 'bg-warning-500',
  cancelled: 'bg-error-500',
};

type OrderListItemProps = {
  order: OrderListItem;
  onPress?: (order: OrderListItem) => void;
  onPrint?: (order: OrderListItem) => void;
  isPrinting?: boolean;
};

export function OrderListItem({
  order,
  onPress,
  onPrint,
  isPrinting,
}: OrderListItemProps) {
  return (
    <Pressable
      onPress={() => onPress?.(order)}
      className="active:opacity-90"
    >
      <VStack className={cn('gap-4 px-5 py-4', variationCardSurfaceClass)}>
        <HStack className="items-start justify-between gap-3">
          <HStack className="min-w-0 flex-1 items-start gap-3">
            <Box
              className={cn(
                'h-14 w-14 shrink-0 items-center justify-center rounded-xl',
                'bg-background-100 dark:bg-background-100'
              )}
            >
              <Icon
                as={CircleDollarSign}
                size="lg"
                className="text-secondary-500 dark:text-secondary-400"
              />
            </Box>
            <VStack className="min-w-0 flex-1 gap-1">
              <Text className="text-base font-bold text-typography-900 dark:text-typography-0">
                Order #{order.orderNumber}
              </Text>
              <HStack className="items-center gap-1.5">
                <Icon
                  as={Clock}
                  size="xs"
                  className="text-secondary-400 dark:text-secondary-500"
                />
                <Text className="text-sm text-secondary-500 dark:text-typography-400">
                  {order.timeLabel}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <HStack className="shrink-0 items-center gap-2">
            <Pressable
              className={cn(
                'h-10 w-10 items-center justify-center rounded-xl bg-background-100 active:opacity-80 dark:bg-background-100',
                isPrinting && 'opacity-50'
              )}
              disabled={isPrinting}
              onPress={() => onPrint?.(order)}
            >
              <Icon
                as={Printer}
                size="sm"
                className="text-typography-700 dark:text-typography-300"
              />
            </Pressable>

            <Badge
              action={statusBadgeAction[order.status]}
              variant="outline"
              size="sm"
              className="rounded-full border px-2.5 py-1"
            >
              <HStack className="items-center gap-1.5">
                <Box
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    statusDotClass[order.status]
                  )}
                />
                <BadgeText className="font-bold">{statusLabel[order.status]}</BadgeText>
              </HStack>
            </Badge>
          </HStack>
        </HStack>

        <HStack className="items-end justify-between gap-4">
          <VStack className="min-w-0 flex-1 gap-1">
            <Text className={fieldLabelClass}>CUSTOMER</Text>
            <Text className="text-base font-bold text-typography-900 dark:text-typography-0">
              {order.customerName}
              <Text className="font-normal text-secondary-500 dark:text-typography-400">
                {' '}
                • {order.payment}
              </Text>
            </Text>
          </VStack>
          <VStack className="items-end gap-1">
            <Text className={fieldLabelClass}>TOTAL</Text>
            <Text className="text-lg font-bold text-primary-500">
              {formatRs(order.total)}
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Pressable>
  );
}

