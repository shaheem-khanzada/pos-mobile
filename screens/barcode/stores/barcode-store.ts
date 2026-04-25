import { create } from 'zustand';

type BarcodeState = {
  scannedBarcode: string | null;
  scannedAt: number | null;
  setScannedBarcode: (value: string) => void;
  clearScannedBarcode: () => void;
};

export const useBarcodeStore = create<BarcodeState>()((set) => ({
  scannedBarcode: null,
  scannedAt: null,
  setScannedBarcode: (value) =>
    set({
      scannedBarcode: value.trim(),
      scannedAt: Date.now(),
    }),
  clearScannedBarcode: () =>
    set({
      scannedBarcode: null,
      scannedAt: null,
    }),
}));

