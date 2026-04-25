import { create } from 'zustand';

export type ToastVariant = 'error' | 'success' | 'warning' | 'info';

export type Toast = {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
  durationMs?: number;
};

type ToastStore = {
  toast: Toast | null;
  sequence: number;
  setToast: (input: Omit<Toast, 'id'>) => void;
  clearToast: () => void;
};

export const useToastStore = create<ToastStore>((set, get) => ({
  toast: null,
  sequence: 0,
  setToast: (input) => {
    const nextId = get().sequence + 1;
    set({
      sequence: nextId,
      toast: {
        id: nextId,
        ...input,
      },
    });
  },
  clearToast: () => set({ toast: null }),
}));

export function setToast(input: Omit<Toast, 'id'>) {
  useToastStore.getState().setToast(input);
}

export function clearToast() {
  useToastStore.getState().clearToast();
}

