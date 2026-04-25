import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
  BottomSheetPortal,
  useBottomSheetContext,
} from '@/components/ui/bottomsheet';
import { cn } from '@/lib/cn';
import { formatRs } from '@/lib/format-rs';
import { fieldLabelClass, standardInputClass } from '@/theme/ui';
import { useProductsListQuery } from '@/hooks/use-products-mutations';
import { useCartItems } from '@/screens/orders/stores/cart-items-context';
import { cartItemUnitPrice } from '@/screens/orders/types';
import {
  addOrIncrementCatalogCartItem,
  applyVariantSelectionToCartItems,
  decrementOrRemoveCatalogCartItem,
  qtyForCatalog,
  type CatalogProduct,
  type MergeVariantPayload,
} from '@/screens/orders/utils/product-catalog';
import {
  SelectProductVariantSheetContent,
  isVariantSheetMultiPayload,
  type VariantSheetConfirmUnion,
} from '@/components/select-product-variant-sheet';
import { SelectedProductListSheetContent } from '@/components/selected-product-list-sheet';
import { ProductPickerItem } from '@/screens/orders/components/select-products/product-picker-item';
import { PlaceOrderBar } from '@/screens/orders/components/create-order/place-order-bar';

type SheetMode = 'variant' | 'selection' | null;

/**
 * Must render under {@link BottomSheet} so {@link useBottomSheetContext} is defined.
 */
function SelectProductsMain({
  sheetMode,
  setSheetMode,
  variantSheetProduct,
  setVariantSheetProduct,
}: {
  sheetMode: SheetMode;
  setSheetMode: React.Dispatch<React.SetStateAction<SheetMode>>;
  variantSheetProduct: CatalogProduct | null;
  setVariantSheetProduct: React.Dispatch<
    React.SetStateAction<CatalogProduct | null>
  >;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleOpen } = useBottomSheetContext();
  const { cartItems, setCartItems } = useCartItems();
  const [search, setSearch] = useState('');
  const { scannedBarcode, clearScannedBarcode, openBarcodeScanner } = useBarcode();
  const listRef = useRef<FlatList<CatalogProduct>>(null);
  const productsQuery = useProductsListQuery({ limit: 100, sort: '-createdAt' });
  const products = productsQuery.data ?? [];

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? products.filter(
          (p) =>
            (p.title ?? '').toLowerCase().includes(q) ||
            (p.barcode ?? '').toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q)
        )
      : products;
    return list;
  }, [products, search]);

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
      requestAnimationFrame(() => handleOpen());
    },
    [handleOpen, setSheetMode, setVariantSheetProduct]
  );

  const openSelectionSheet = useCallback(() => {
    setSheetMode('selection');
    setVariantSheetProduct(null);
    requestAnimationFrame(() => handleOpen());
  }, [handleOpen, setSheetMode, setVariantSheetProduct]);

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
    ({ item }: { item: CatalogProduct }) => (
      <ProductPickerItem
        product={item}
        selectedQty={qtyForCatalog(cartItems, item.id)}
        onIncrement={() => onIncrementProduct(item)}
        onDecrement={() => onDecrementProduct(item)}
        onOpenVariantSheet={() => openVariantSheet(item)}
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
              'dark:border-primary-700 dark:bg-primary-950/20'
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
    setSearch(scannedBarcode);
    clearScannedBarcode();
  }, [clearScannedBarcode, scannedBarcode]);

  const backdropComponent = useCallback(
    (props: object) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        className="bg-black/50"
      />
    ),
    []
  );

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

        <FlatList
          ref={listRef}
          data={filteredCatalog}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          renderItem={renderItem}
          ListEmptyComponent={
            productsQuery.isPending ? (
              <Text className="py-8 text-center text-sm text-secondary-500 dark:text-typography-400">
                Loading products…
              </Text>
            ) : productsQuery.isError ? (
              <Text className="py-8 text-center text-sm text-error-500">
                Could not load products.
              </Text>
            ) : search.trim() ? (
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
          keyboardShouldPersistTaps="handled"
        />
      </VStack>

      <Box
        className="border-t border-outline-200 bg-app-page px-5 pt-3"
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

      <BottomSheetPortal
        snapPoints={['55%', '90%']}
        backdropComponent={backdropComponent}
        enablePanDownToClose
        handleComponent={() => (
          <BottomSheetDragIndicator className="bg-app-surface" />
        )}
      >
        {sheetMode === 'variant' && variantSheetProduct ? (
          <SelectProductVariantSheetContent
            key={variantSheetProduct.id}
            product={variantSheetProduct}
            cartItems={cartItems}
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
            onAdjustCartItemQty={adjustLineQty}
            onRemoveCartItem={removeLine}
            onClearAll={clearAllCartItems}
          />
        ) : null}
      </BottomSheetPortal>
    </SafeAreaView>
  );
}

export function SelectProductsScreen() {
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
        sheetMode={sheetMode}
        setSheetMode={setSheetMode}
        variantSheetProduct={variantSheetProduct}
        setVariantSheetProduct={setVariantSheetProduct}
      />
    </BottomSheet>
  );
}
