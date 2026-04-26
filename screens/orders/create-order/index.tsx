import { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Phone, Sun, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ComponentRef } from 'react';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import { formatRs } from '@/lib/format-rs';
import {
  fieldLabelClass,
  inputTextClass,
  sectionActionLinkClass,
  standardInputClass,
  variationCardSurfaceClass,
} from '@/theme/ui';
import { useCreateCartMutation } from '@/hooks/use-carts-mutations';
import { setToast } from '@/toast/store';
import { CartItemRow } from '@/screens/orders/components/create-order/cart-item';
import { PlaceOrderBar } from '@/screens/orders/components/create-order/place-order-bar';
import { cartItemListKey } from '@/screens/orders/types';
import { useCartItems } from '@/screens/orders/stores/cart-items-context';
import { Cart } from '@/payload/types';

const PAYMENT_OPTIONS = [
  { id: 'cash' as const, label: 'CASH' },
  { id: 'card' as const, label: 'CARD' },
  { id: 'online' as const, label: 'ONLINE' },
];

export function CreateOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { cartItems, setCartItems, subtotal, changeQty, removeCartItem } = useCartItems();

  const createCartMutation = useCreateCartMutation();

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [orderSectionY, setOrderSectionY] = useState<number | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [discountText, setDiscountText] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<Cart['paymentMethod']>('cash');

  const discount = useMemo(() => {
    const n = parseFloat(discountText.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [discountText]);

  const total = Math.max(0, subtotal - discount);

  const cartItemCount = cartItems.length;

  const scrollToOrderItems = useCallback(() => {
    if (orderSectionY == null) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, orderSectionY - 12),
      animated: true,
    });
  }, [orderSectionY]);

  const openSelectProducts = useCallback(() => {
    router.push('/tabs/select-products');
  }, [router]);

  const onPlaceOrder = useCallback(async () => {
    if (cartItems.length === 0) {
      setToast({
        variant: 'warning',
        title: 'No items',
        description: 'Add at least one product before placing the order.',
      });
      return;
    }

    const payload: Partial<Cart> = {
      customerName: fullName.trim() || 'Guest',
      customerPhone: phone.trim() || null,
      paymentMethod: paymentMethod,
      items: cartItems,
      subtotal: total,
      currency: 'PKR',
      status: 'purchased',
      purchasedAt: new Date().toISOString(),
    };

    try {
      await createCartMutation.mutateAsync(payload);
      setCartItems([]);
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not place order.';
      setToast({
        variant: 'error',
        title: 'Order failed',
        description: message,
      });
    }
  }, [
    createCartMutation,
    fullName,
    cartItems,
    paymentMethod,
    phone,
    router,
    setCartItems,
    total,
  ]);

  return (
    <SafeAreaView
      className="flex-1 bg-app-page"
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="grow gap-10 px-5 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <HStack className="items-center justify-between pb-6">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon as={ArrowLeft} size="lg" className="text-typography-900" />
          </Pressable>
          <Text className="text-xl font-bold text-typography-900">
            New Order
          </Text>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Theme"
          >
            <Icon as={Sun} className="text-emerald-500" size="md" />
          </Pressable>
        </HStack>

        <VStack space="md" className="w-full">
          <Text className={fieldLabelClass}>CUSTOMER INFO</Text>
          <VStack
            className={cn('gap-5 p-5', variationCardSurfaceClass)}
            space="lg"
          >
            <VStack space="sm" className="w-full">
              <Text className={cn(fieldLabelClass, 'ml-0.5')}>Full name</Text>
              <Input
                size="lg"
                variant="outline"
                className={cn(standardInputClass, 'border-0 pl-0')}
              >
                <InputSlot className="justify-center pl-4 pr-2">
                  <InputIcon
                    as={User}
                    size="md"
                    className="text-secondary-400"
                  />
                </InputSlot>
                <InputField
                  className={cn(inputTextClass, 'px-0 pr-4')}
                  placeholder="e.g. Abdullah Ali"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </Input>
            </VStack>

            <VStack space="sm" className="w-full">
              <Text className={cn(fieldLabelClass, 'ml-0.5')}>
                Phone number
              </Text>
              <Input
                size="lg"
                variant="outline"
                className={cn(standardInputClass, 'border-0 pl-0')}
              >
                <InputSlot className="justify-center pl-4 pr-2">
                  <InputIcon
                    as={Phone}
                    size="md"
                    className="text-secondary-400"
                  />
                </InputSlot>
                <InputField
                  className={cn(inputTextClass, 'px-0 pr-4')}
                  placeholder="+92 3XX XXXXXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </Input>
            </VStack>
          </VStack>
        </VStack>

        <Box
          className="w-full"
          onLayout={(e) => {
            setOrderSectionY(e.nativeEvent.layout.y);
          }}
        >
          <VStack space="md" className="w-full">
            <HStack className="items-center justify-between">
              <Text className={fieldLabelClass}>ORDER ITEMS</Text>
              <Pressable onPress={openSelectProducts} hitSlop={8}>
                <Text className={sectionActionLinkClass}>+ ADD ITEMS</Text>
              </Pressable>
            </HStack>

            <VStack className={cn('p-5 pt-2', variationCardSurfaceClass)}>
              {cartItems.length === 0 ? (
                <Text className="py-6 text-center text-sm text-secondary-500 dark:text-typography-400">
                  No items yet. Tap + ADD ITEMS to add products.
                </Text>
              ) : (
                cartItems.map((line, index) => (
                  <CartItemRow
                    key={cartItemListKey(line)}
                    line={line}
                    isLast={index === cartItems.length - 1}
                    onChangeQty={changeQty}
                    onRemove={removeCartItem}
                  />
                ))
              )}

              <VStack className="mt-2 gap-3 border-t border-outline-100 pt-4">
                <HStack className="items-center justify-between">
                  <Text className={fieldLabelClass}>SUBTOTAL</Text>
                  <Text className="text-base font-bold text-typography-900 dark:text-typography-0">
                    {formatRs(subtotal)}
                  </Text>
                </HStack>

                <HStack className="items-center justify-between gap-3">
                  <Text className="text-label font-bold uppercase tracking-widest text-error-400">
                    DISCOUNT
                  </Text>
                  <Input
                    size="md"
                    variant="outline"
                    className="h-11 w-24 rounded-2xl border border-outline-100 bg-background-100 px-3 dark:border-outline-100 dark:bg-background-100"
                  >
                    <InputField
                      className="text-right text-sm font-bold text-typography-900 dark:text-typography-0"
                      value={discountText}
                      onChangeText={setDiscountText}
                      keyboardType="decimal-pad"
                    />
                  </Input>
                </HStack>

                <HStack className="items-center justify-between pt-1">
                  <Text className={fieldLabelClass}>TOTAL</Text>
                  <Text className="text-xl font-bold text-primary-500">
                    {formatRs(total)}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </VStack>
        </Box>

        <VStack space="md" className="w-full">
          <Text className={fieldLabelClass}>PAYMENT METHOD</Text>
          <HStack
            className={cn(
              'flex-wrap gap-3',
              variationCardSurfaceClass,
              'p-4'
            )}
          >
            {PAYMENT_OPTIONS.map(({ id, label }) => {
              const selected = paymentMethod === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setPaymentMethod(id)}
                  className="active:opacity-90"
                >
                  <Badge
                    action="muted"
                    variant="outline"
                    size="lg"
                    className={cn(
                      'rounded-full px-5 py-2.5',
                      selected
                        ? 'border-0 bg-primary-500'
                        : 'border border-outline-100 bg-transparent dark:border-outline-100'
                    )}
                  >
                    <BadgeText
                      className={cn(
                        'text-xs font-bold',
                        selected
                          ? 'text-white'
                          : 'text-secondary-500 dark:text-typography-400'
                      )}
                    >
                      {label}
                    </BadgeText>
                  </Badge>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>
      </ScrollView>

      <Box
        className="border-t border-outline-100 bg-app-page px-5 pt-3"
        style={{ paddingBottom: Math.max(12, insets.bottom) }}
      >
        <PlaceOrderBar
          total={total}
          cartBadgeCount={cartItemCount}
          onViewItems={scrollToOrderItems}
          onConfirm={onPlaceOrder}
          confirmDisabled={cartItemCount === 0}
          isConfirmLoading={createCartMutation.isPending}
        />
      </Box>
    </SafeAreaView>
  );
}
