import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware';

type SyncMetaState = {
  lastFetchedProducts: string | null;
  lastFetchOrders: string | null;
  lastFetchedCategories: string | null;
  lastFetchedVariantTypes: string | null;
  lastFetchedVariantOptions: string | null;
  lastFetchedMedia: string | null;
  setLastFetchedProducts: (isoDate: string) => void;
  setLastFetchOrders: (isoDate: string) => void;
  setLastFetchedCategories: (isoDate: string) => void;
  setLastFetchedVariantTypes: (isoDate: string) => void;
  setLastFetchedVariantOptions: (isoDate: string) => void;
  setLastFetchedMedia: (isoDate: string) => void;
};

const mmkv = createMMKV({
  id: 'pos-sync-meta',
});

const mmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  removeItem: (name) => {
    mmkv.remove(name);
  },
};

export const useSyncMetaStore = create<SyncMetaState>()(
  persist(
    (set) => ({
      lastFetchedProducts: null,
      lastFetchOrders: null,
      lastFetchedCategories: null,
      lastFetchedVariantTypes: null,
      lastFetchedVariantOptions: null,
      lastFetchedMedia: null,
      setLastFetchedProducts: (isoDate) => set({ lastFetchedProducts: isoDate }),
      setLastFetchOrders: (isoDate) => set({ lastFetchOrders: isoDate }),
      setLastFetchedCategories: (isoDate) => set({ lastFetchedCategories: isoDate }),
      setLastFetchedVariantTypes: (isoDate) => set({ lastFetchedVariantTypes: isoDate }),
      setLastFetchedVariantOptions: (isoDate) => set({ lastFetchedVariantOptions: isoDate }),
      setLastFetchedMedia: (isoDate) => set({ lastFetchedMedia: isoDate }),
    }),
    {
      name: 'database-sync-meta',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export function setLastFetchedProducts(isoDate: string) {
  useSyncMetaStore.getState().setLastFetchedProducts(isoDate);
}

export function getLastFetchedProducts() {
  return useSyncMetaStore.getState().lastFetchedProducts;
}

export function setLastFetchOrders(isoDate: string) {
  useSyncMetaStore.getState().setLastFetchOrders(isoDate);
}

export function getLastFetchOrders() {
  return useSyncMetaStore.getState().lastFetchOrders;
}

export function setLastFetchedCategories(isoDate: string) {
  useSyncMetaStore.getState().setLastFetchedCategories(isoDate);
}

export function getLastFetchedCategories() {
  return useSyncMetaStore.getState().lastFetchedCategories;
}

export function setLastFetchedVariantTypes(isoDate: string) {
  useSyncMetaStore.getState().setLastFetchedVariantTypes(isoDate);
}

export function getLastFetchedVariantTypes() {
  return useSyncMetaStore.getState().lastFetchedVariantTypes;
}

export function setLastFetchedVariantOptions(isoDate: string) {
  useSyncMetaStore.getState().setLastFetchedVariantOptions(isoDate);
}

export function getLastFetchedVariantOptions() {
  return useSyncMetaStore.getState().lastFetchedVariantOptions;
}

export function setLastFetchedMedia(isoDate: string) {
  useSyncMetaStore.getState().setLastFetchedMedia(isoDate);
}

export function getLastFetchedMedia() {
  return useSyncMetaStore.getState().lastFetchedMedia;
}

export function resetSyncMetaStore() {
  useSyncMetaStore.setState({
    lastFetchedProducts: null,
    lastFetchOrders: null,
    lastFetchedCategories: null,
    lastFetchedVariantTypes: null,
    lastFetchedVariantOptions: null,
    lastFetchedMedia: null,
  });
}
