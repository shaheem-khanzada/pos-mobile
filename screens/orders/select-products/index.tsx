import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import BottomSheetGorhom from '@gorhom/bottom-sheet';
import { ArrowLeft, ChevronRight, ScanLine, Search, ShoppingCart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useBarcode } from '@/screens/barcode/hooks/use-barcode';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/bottomsheet';
import { BottomSheetWrapper } from '@/components/app-bottom-sheet';
import { cn } from '@/lib/cn';
import { formatRs } from '@/lib/format-rs';
import { fieldLabelClass, standardInputClass } from '@/theme/ui';
import { fetchProductsObservable } from '@/database';
import type Product from '@/database/model/Product';
import { useCartItems } from '@/screens/orders/stores/cart-items-context';
import { cartItemUnitPrice } from '@/screens/orders/types';
import { findBarcodeCatalogMatch } from '@/screens/barcode/utils/find-barcode-catalog-match';
import {
  addOrIncrementCatalogCartItem,
  addOrIncrementVariantCartItem,
  applyVariantSelectionToCartItems,
  decrementOrRemoveCatalogCartItem,
  type CatalogProduct,
  type MergeVariantPayload,
} from '@/screens/orders/utils/product-catalog';
import {
  SelectProductVariantSheetContent,
  isVariantSheetMultiPayload,
  type VariantSheetConfirmUnion,
} from '@/components/select-product-variant-sheet';
import { SelectedProductListSheetContent } from '@/components/selected-product-list-sheet';
import { ProductPickerListItem } from '@/screens/orders/components/select-products/product-picker-list-item';
import { PlaceOrderBar } from '@/screens/orders/components/create-order/place-order-bar';
import { useSelectProductsSheetRef } from '@/screens/orders/hooks/use-select-products-sheet-ref';

type SheetMode = 'variant' | 'selection' | null;

/**
 * Renders under Gluestack `BottomSheet` so `BottomSheetWrapper` can propagate index changes
 * via context `handleClose`; sheet content also receives `closeSheet` as `onRequestClose`
 * (same ref + `close()` pattern as create-product media / variant sheets).
 */
function SelectProductsMain({
  sheetMode,
  setSheetMode,
  variantSheetProduct,
  setVariantSheetProduct,
  sheetRef,
  openSheet,
  closeSheet,
}: {
  sheetMode: SheetMode;
  setSheetMode: React.Dispatch<React.SetStateAction<SheetMode>>;
  variantSheetProduct: CatalogProduct | null;
  setVariantSheetProduct: React.Dispatch<
    React.SetStateAction<CatalogProduct | null>
  >;
  sheetRef: React.RefObject<BottomSheetGorhom | null>;
  openSheet: () => void;
  closeSheet: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cartItems, setCartItems } = useCartItems();
  const [search, setSearch] = useState('');
  const { scannedBarcode, clearScannedBarcode, openBarcodeScanner } = useBarcode();
  const listRef = useRef<FlatList<Product>>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const fetchProducts = useCallback(() => {
    const observable = fetchProductsObservable({
      search: search.trim() || undefined,
    });
    return observable.subscribe((rows) => {
      setProducts(rows);
      setIsLoadingProducts(false);
    });
  }, [search]);

  useEffect(() => {
    const sub = fetchProducts();
    return () => sub.unsubscribe();
  }, [fetchProducts]);

  const subtotal = useMemo(
    () => cartItems.reduce((s, l) => s + cartItemUnitPrice(l) * l.quantity, 0),
    [cartItems]
  );

  const totalUnits = useMemo(
    () => cartItems.reduce((s, l) => s + l.quantity, 0),
    [cartItems]
  );

  const onIncrementProduct = useCallback(
    (product: CatalogProduct) => {
      setCartItems((prev) => addOrIncrementCatalogCartItem(prev, product));
    },
    [setCartItems]
  );

  const onDecrementProduct = useCallback(
    (product: CatalogProduct) => {
      setCartItems((prev) => decrementOrRemoveCatalogCartItem(prev, product));
    },
    [setCartItems]
  );

  const onVariantConfirm = useCallback(
    (product: CatalogProduct, payload: VariantSheetConfirmUnion) => {
      const items: MergeVariantPayload[] = isVariantSheetMultiPayload(payload)
        ? payload.items.map((item) => ({
            productId: product.id,
            variantId: item.variantId,
            name: item.itemDisplayName,
            priceInPKR: item.priceInPKR,
            costInPKR: item.costInPKR ?? null,
            quantity: item.qty,
            payloadProductId: product.id,
            variantRelationId: product.variants?.find(
              (v) => v.id === item.variantId
            )?.id,
          }))
        : [
            {
              productId: product.id,
              variantId: payload.variantId,
              name: payload.itemDisplayName,
              priceInPKR: payload.priceInPKR,
              costInPKR: payload.costInPKR ?? null,
              quantity: payload.qty,
              payloadProductId: product.id,
              variantRelationId: product.variants?.find(
                (v) => v.id === payload.variantId
              )?.id,
            },
          ];
      setCartItems((prev) => applyVariantSelectionToCartItems(prev, product, items));
    },
    [setCartItems]
  );

  const openVariantSheet = useCallback(
    (product: CatalogProduct) => {
      setSheetMode('variant');
      setVariantSheetProduct(product);
    },
    [setSheetMode, setVariantSheetProduct]
  );

  const openSelectionSheet = useCallback(() => {
    setSheetMode('selection');
    setVariantSheetProduct(null);
  }, [setSheetMode, setVariantSheetProduct]);

  useEffect(() => {
    if (sheetMode === 'selection') {
      requestAnimationFrame(() => openSheet());
      return;
    }
    if (sheetMode === 'variant' && variantSheetProduct) {
      requestAnimationFrame(() => openSheet());
    }
  }, [openSheet, sheetMode, variantSheetProduct]);

  const adjustLineQty = useCallback(
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

  const removeLine = useCallback(
    (lineId: string) => {
      setCartItems((prev) => prev.filter((l) => l.id !== lineId));
    },
    [setCartItems]
  );

  const clearAllCartItems = useCallback(() => {
    setCartItems([]);
  }, [setCartItems]);

  const scrollListTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const onDone = useCallback(() => {
    router.back();
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductPickerListItem
        product={item}
        cartItems={cartItems}
        onIncrement={onIncrementProduct}
        onDecrement={onDecrementProduct}
        onOpenVariantSheet={openVariantSheet}
      />
    ),
    [cartItems, onIncrementProduct, onDecrementProduct, openVariantSheet]
  );

  const header = useMemo(
    () => (
      <VStack className="gap-4 pb-4">
        <Pressable
          onPress={openSelectionSheet}
          className="active:opacity-95"
        >
          <HStack
            className={cn(
              'items-center justify-between gap-3 rounded-3xl border border-primary-300 bg-primary-50/40 p-4',
              ''
            )}
          >
            <Box className="h-12 w-12 items-center justify-center rounded-xl bg-primary-500">
              <Icon as={ShoppingCart} size="lg" className="text-white" />
            </Box>
            <VStack className="min-w-0 flex-1">
              <Text className={fieldLabelClass}>SELECTED LIST</Text>
              <Text className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {totalUnits} Total Units
              </Text>
            </VStack>
            <VStack className="items-end">
              <Text className={fieldLabelClass}>REVIEW LIST</Text>
              <HStack className="items-center gap-1">
                <Text className="text-base font-bold text-typography-900 dark:text-typography-0">
                  {formatRs(subtotal)}
                </Text>
                <Icon
                  as={ChevronRight}
                  size="sm"
                  className="text-secondary-500"
                />
              </HStack>
            </VStack>
          </HStack>
        </Pressable>

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
            placeholder="Search by name or code..."
            value={search}
            onChangeText={setSearch}
          />
        </Input>
      </VStack>
    ),
    [openSelectionSheet, subtotal, totalUnits, search]
  );


  useEffect(() => {
    if (!scannedBarcode) return;
    let cancelled = false;
    void (async () => {
      const code = scannedBarcode;
      const match = await findBarcodeCatalogMatch(code);
      if (cancelled) return;
      if (match) {
        if (match.kind === 'simple') {
          setCartItems((prev) =>
            addOrIncrementCatalogCartItem(prev, match.product)
          );
        } else {
          setCartItems((prev) =>
            addOrIncrementVariantCartItem(prev, match.product, match.variant)
          );
        }
      } else {
        setSearch(code);
      }
      clearScannedBarcode();
    })();
    return () => {
      cancelled = true;
    };
  }, [clearScannedBarcode, scannedBarcode, setCartItems]);

  return (
    <SafeAreaView
      className="flex-1 bg-app-page"
      edges={['top', 'left', 'right']}
    >
      <VStack className="flex-1 px-5 pt-4">
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
            Add Products
          </Text>
          <Pressable
            onPress={() => openBarcodeScanner({ multi: true })}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 active:opacity-80"
          >
            <Icon as={ScanLine} className="text-primary-500" size="md" />
          </Pressable>
        </HStack>

        {isLoadingProducts ? (
          <VStack className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator size="small" />
            <Text className="text-sm text-typography-500">Loading products...</Text>
          </VStack>
        ) : (
          <FlatList
            ref={listRef}
            data={products}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={header}
            renderItem={renderItem}
            ListEmptyComponent={
              search.trim() ? (
                <Text className="py-8 text-center text-sm text-secondary-500 dark:text-typography-400">
                  No products match your search.
                </Text>
              ) : (
                <Text className="py-8 text-center text-sm text-secondary-500 dark:text-typography-400">
                  No products yet.
                </Text>
              )
            }
            contentContainerClassName="grow gap-3 pb-4"
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          />
        )}
      </VStack>

      <Box
        className="border-t border-outline-100 bg-app-page px-5 pt-3"
        style={{ paddingBottom: Math.max(12, insets.bottom) }}
      >
        <PlaceOrderBar
          total={subtotal}
          cartBadgeCount={totalUnits}
          onViewItems={scrollListTop}
          onConfirm={onDone}
          confirmLabel="DONE"
        />
      </Box>

      <BottomSheetWrapper
        ref={sheetRef}
        snapPoints={['28%', '88%']}
        enablePanDownToClose
        enableDynamicSizing={true}
      >
        {sheetMode === 'variant' && variantSheetProduct ? (
          <SelectProductVariantSheetContent
            key={variantSheetProduct.id}
            product={variantSheetProduct}
            cartItems={cartItems}
            onRequestClose={closeSheet}
            onConfirm={(payload: VariantSheetConfirmUnion) =>
              onVariantConfirm(variantSheetProduct, payload)
            }
          />
        ) : null}
        {sheetMode === 'selection' ? (
          <SelectedProductListSheetContent
            key="selection-list"
            cartItems={cartItems}
            totalUnits={totalUnits}
            subtotal={subtotal}
            onRequestClose={closeSheet}
            onAdjustCartItemQty={adjustLineQty}
            onRemoveCartItem={removeLine}
            onClearAll={clearAllCartItems}
          />
        ) : null}
      </BottomSheetWrapper>
    </SafeAreaView>
  );
}

export function SelectProductsScreen() {
  const { sheetRef, openSheet, closeSheet } = useSelectProductsSheetRef({
    snapToIndex: 1,
  });
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [variantSheetProduct, setVariantSheetProduct] =
    useState<CatalogProduct | null>(null);

  return (
    <BottomSheet
      snapToIndex={1}
      onClose={() => {
        setSheetMode(null);
        setVariantSheetProduct(null);
      }}
    >
      <SelectProductsMain
        sheetRef={sheetRef}
        openSheet={openSheet}
        closeSheet={closeSheet}
        sheetMode={sheetMode}
        setSheetMode={setSheetMode}
        variantSheetProduct={variantSheetProduct}
        setVariantSheetProduct={setVariantSheetProduct}
      />
    </BottomSheet>
  );
}
