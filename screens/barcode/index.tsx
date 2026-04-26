import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Vibration, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { BlurView } from 'expo-blur';
import { ArrowLeft, Settings } from 'lucide-react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotomSheetWrapper } from '@/components/app-bottom-sheet';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { SelectedProductListSheetContent } from '@/components/selected-product-list-sheet';
import { useProductsListQuery } from '@/hooks/use-products-mutations';
import { useCartItems } from '@/screens/orders/stores/cart-items-context';
import {
  addOrIncrementCatalogCartItem,
  addOrIncrementVariantCartItem,
} from '@/screens/orders/utils/product-catalog';
import { cartItemUnitPrice } from '@/screens/orders/types';
import { useBarcodeStore } from './stores/barcode-store';
import { ExpoBarcodeCamera } from './components/expo-barcode-camera';
import { resolveBarcodeToCatalogMatch } from './utils/resolve-barcode-match';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = Math.min(width, height) * 0.8;
const frameLeft = (width - FRAME_SIZE) / 2;
const frameTop = (height - FRAME_SIZE) / 2;
const SCAN_DEBOUNCE_MS = 350;

const CART_SHEET_SNAPS = ['20%', '55%'];

export function BarcodeScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ multi?: string }>();
  const isMulti =
    params.multi === '1' || params.multi === 'true' || params.multi === 'yes';

  const setScannedBarcode = useBarcodeStore((s) => s.setScannedBarcode);
  const { cartItems, setCartItems } = useCartItems();
  const productsQuery = useProductsListQuery({ limit: 100, sort: '-createdAt' });
  const products = productsQuery.data ?? [];

  const [cartSheetIndex, setCartSheetIndex] = useState(() =>
    isMulti && cartItems.length > 0 ? 0 : -1
  );
  /** Multi-scan: pause camera after each read until user taps to resume. */
  const [scannerPaused, setScannerPaused] = useState(false);

  const player = useAudioPlayer(require('@/assets/sounds/beep.wav'));
  const lastScanRef = useRef<{ value?: string; at: number }>({ value: undefined, at: 0 });
  const debounceUntilRef = useRef(0);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  }, []);

  useEffect(() => {
    if (!isMulti) return;
    if (cartItems.length === 0) {
      setCartSheetIndex(-1);
    }
  }, [isMulti, cartItems.length]);

  const playBeep = useCallback(() => {
    void player.seekTo(0);
    player.play();
  }, [player]);

  const subtotal = useMemo(
    () => cartItems.reduce((s, l) => s + cartItemUnitPrice(l) * l.quantity, 0),
    [cartItems]
  );
  const totalUnits = useMemo(
    () => cartItems.reduce((s, l) => s + l.quantity, 0),
    [cartItems]
  );

  const onScannedValue = useCallback(
    (value: string) => {
      const now = Date.now();
      if (now < debounceUntilRef.current) return;

      lastScanRef.current = { value, at: now };
      debounceUntilRef.current = now + SCAN_DEBOUNCE_MS;

      playBeep();
      Vibration.vibrate(100);

      if (!isMulti) {
        setScannedBarcode(value);
        router.back();
        return;
      }

      if (productsQuery.isPending && products.length === 0) {
        setCartSheetIndex(0);
        setScannerPaused(true);
        return;
      }

      const match = resolveBarcodeToCatalogMatch(products, value);
      if (!match) {
        setCartSheetIndex(0);
        setScannerPaused(true);
        return;
      }

      if (match.kind === 'simple') {
        setCartItems((prev) => addOrIncrementCatalogCartItem(prev, match.product));
      } else {
        setCartItems((prev) =>
          addOrIncrementVariantCartItem(prev, match.product, match.variant)
        );
      }

      setCartSheetIndex(0);
      setScannerPaused(true);
    },
    [isMulti, playBeep, products, productsQuery.isPending, router, setCartItems, setScannedBarcode]
  );

  const adjustCartLineQty = useCallback(
    (lineId: string, delta: number) => {
      setCartItems((prev) => {
        const idx = prev.findIndex((l) => l.id === lineId);
        if (idx < 0) return prev;
        const line = prev[idx];
        const q = line.quantity + delta;
        if (q <= 0) return prev.filter((l) => l.id !== lineId);
        return prev.map((l, i) => (i === idx ? { ...l, quantity: q } : l));
      });
    },
    [setCartItems]
  );
  const removeCartItem = useCallback(
    (lineId: string) => {
      setCartItems((prev) => prev.filter((l) => l.id !== lineId));
    },
    [setCartItems]
  );
  const clearAllCartItems = useCallback(() => {
    setCartItems([]);
  }, [setCartItems]);

  return (
    <Box className="flex-1">
      <ExpoBarcodeCamera
        onScanned={onScannedValue}
        paused={isMulti && scannerPaused}
      />

      <SafeAreaView
        className="absolute left-0 right-0 top-0 z-[120] bg-app-page"
        edges={['top', 'left', 'right']}
      >
        <HStack className="items-center justify-between px-5 pb-6 pt-4">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon as={ArrowLeft} size="lg" className="text-typography-900" />
          </Pressable>
          <Text className="text-xl font-bold text-typography-900">Scan Code</Text>
          <Pressable
            onPress={() => router.push('/tabs/profile')}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Icon as={Settings} size="md" className="text-primary-500" />
          </Pressable>
        </HStack>
      </SafeAreaView>

      <Box className="absolute inset-0">
        <MaskedView
          style={StyleSheet.absoluteFillObject}
          maskElement={
            <Box className="flex-1 bg-transparent">
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width,
                  height: frameTop,
                  backgroundColor: '#000',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: height / 2 + FRAME_SIZE / 2,
                  width,
                  height: height - (height / 2 + FRAME_SIZE / 2),
                  backgroundColor: '#000',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: height / 2 - FRAME_SIZE / 2,
                  width: width / 2 - FRAME_SIZE / 2,
                  height: FRAME_SIZE,
                  backgroundColor: '#000',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left: width / 2 + FRAME_SIZE / 2,
                  top: height / 2 - FRAME_SIZE / 2,
                  width: width - (width / 2 + FRAME_SIZE / 2),
                  height: FRAME_SIZE,
                  backgroundColor: '#000',
                }}
              />
            </Box>
          }
        >
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
        </MaskedView>

        <Box
          className="absolute bg-transparent"
          style={{
            left: frameLeft,
            top: frameTop,
            width: FRAME_SIZE,
            height: FRAME_SIZE,
          }}
        >
          <Box className="absolute -left-0.5 -top-0.5 h-[22px] w-[22px] border-white border-t-[3px] border-l-[3px]" />
          <Box className="absolute -right-0.5 -top-0.5 h-[22px] w-[22px] border-white border-t-[3px] border-r-[3px]" />
          <Box className="absolute -bottom-0.5 -left-0.5 h-[22px] w-[22px] border-white border-b-[3px] border-l-[3px]" />
          <Box className="absolute -bottom-0.5 -right-0.5 h-[22px] w-[22px] border-white border-b-[3px] border-r-[3px]" />
        </Box>
      </Box>

      {isMulti && scannerPaused ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Resume camera"
          onPress={() => setScannerPaused(false)}
          style={[StyleSheet.absoluteFillObject, { zIndex: 55 }]}
          className="items-center justify-center"
        >
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
          />
          <VStack
            pointerEvents="none"
            className="mx-5 max-w-[320px] rounded-2xl border border-outline-100 bg-app-surface px-5 py-4 shadow-lg dark:border-outline-100"
          >
            <Text className="text-center text-lg font-bold text-typography-900 dark:text-typography-0">
              Camera paused
            </Text>
            <Text className="mt-2 text-center text-sm leading-snug text-secondary-600 dark:text-typography-400">
              Tap anywhere on the camera view to resume. The cart sheet above this layer still works.
            </Text>
          </VStack>
        </Pressable>
      ) : null}

      {isMulti ? (
        <BotomSheetWrapper
          index={cartSheetIndex}
          onChange={setCartSheetIndex}
          snapPoints={CART_SHEET_SNAPS}
          enableDynamicSizing={false}
          style={{ zIndex: 100 }}
          enablePanDownToClose
        >
          <SelectedProductListSheetContent
            cartItems={cartItems}
            totalUnits={totalUnits}
            subtotal={subtotal}
            onAdjustCartItemQty={adjustCartLineQty}
            onRemoveCartItem={removeCartItem}
            onClearAll={clearAllCartItems}
          />
        </BotomSheetWrapper>
      ) : null}
    </Box>
  );
}

