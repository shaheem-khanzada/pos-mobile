import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import type ProductVariant from '@/database/model/ProductVariant';
import { setToast } from '@/toast/store';

type VariantSheetValue = {
  selectedVariant: ProductVariant | null;
  setSelectedVariant: (variant: ProductVariant | null) => void;
  sheetRef: RefObject<BottomSheet | null>;
  openForCreate: () => void;
  openForEdit: (variant: ProductVariant) => void;
  close: () => void;
  isAddDisabled: boolean;
};

const VariantSheetContext = createContext<VariantSheetValue | null>(null);

type VariantSheetProviderProps = {
  isProductSaved: boolean;
  children: ReactNode;
};

export function VariantSheetProvider({ isProductSaved, children }: VariantSheetProviderProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const sheetRef = useRef<BottomSheet>(null);

  const openForCreate = useCallback(() => {
    if (!isProductSaved) {
      setToast({
        variant: 'warning',
        title: 'Save product first',
        description: 'Create or save the product before adding variants.',
      });
      return;
    }
    setSelectedVariant(null);
    sheetRef.current?.expand();
  }, [isProductSaved]);

  const openForEdit = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    sheetRef.current?.expand();
  }, []);

  const close = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const value = useMemo<VariantSheetValue>(
    () => ({
      selectedVariant,
      setSelectedVariant,
      sheetRef,
      openForCreate,
      openForEdit,
      close,
      isAddDisabled: !isProductSaved,
    }),
    [selectedVariant, openForCreate, openForEdit, close, isProductSaved]
  );

  return <VariantSheetContext.Provider value={value}>{children}</VariantSheetContext.Provider>;
}

export function useVariantSheet(): VariantSheetValue {
  const ctx = useContext(VariantSheetContext);
  if (!ctx) {
    throw new Error('useVariantSheet must be used inside <VariantSheetProvider>');
  }
  return ctx;
}
