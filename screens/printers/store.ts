import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SavedPrinter = {
  id: string;
  name: string;
  connection: 'ble';
};

type PrinterState = {
  defaultPrinter: SavedPrinter | null;
  setDefaultPrinter: (p: SavedPrinter | null) => void;
};

export const usePrinterStore = create<PrinterState>()(
  persist(
    (set) => ({
      defaultPrinter: null,
      setDefaultPrinter: (p) => set({ defaultPrinter: p }),
    }),
    {
      name: 'pos-default-printer',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ defaultPrinter: state.defaultPrinter }),
    }
  )
);
