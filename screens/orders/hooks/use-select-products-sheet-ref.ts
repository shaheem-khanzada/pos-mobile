import { useCallback, useRef } from 'react';
import type BottomSheet from '@gorhom/bottom-sheet';

type Options = {
  /** Index passed to `snapToIndex` when opening (matches parent `BottomSheet` default). */
  snapToIndex?: number;
};

/**
 * Imperative refs for `BottomSheetWrapper` on select-products —
 * same open/expand + close/stop pattern as `MediaPickerProvider` (`snapToIndex` / `sheetRef.close()`).
 */
export function useSelectProductsSheetRef({ snapToIndex = 1 }: Options = {}) {
  const sheetRef = useRef<BottomSheet>(null);

  const openSheet = useCallback(() => {
    sheetRef.current?.snapToIndex(snapToIndex);
  }, [snapToIndex]);

  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  return { sheetRef, openSheet, closeSheet };
}
