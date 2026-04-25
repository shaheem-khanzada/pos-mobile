import { create } from 'zustand';
import type { CartItem } from '@/payload/types';
import { cartItemUnitPrice } from '../types';

type SetCartItemsArg =
  | CartItem[]
  | ((prev: CartItem[]) => CartItem[]);

type CartItemsStore = {
  cartItems: CartItem[];
  setCartItems: (updater: SetCartItemsArg) => void;
  subtotal: number;
  changeQty: (id: string, qty: number) => void;
  removeCartItem: (id: string) => void;
};

function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, l) => sum + cartItemUnitPrice(l) * l.quantity, 0);
}

export const useCartItems = create<CartItemsStore>((set) => ({
  cartItems: [],
  setCartItems: (updater) =>
    set((state) => {
      const nextItems =
        typeof updater === 'function'
          ? (updater as (prev: CartItem[]) => CartItem[])(state.cartItems)
          : updater;
      return {
        cartItems: nextItems,
        subtotal: calcSubtotal(nextItems),
      };
    }),
  subtotal: 0,
  changeQty: (id, qty) =>
    set((state) => {
      const nextItems = state.cartItems.map((l) =>
        l.id === id ? { ...l, quantity: qty } : l
      );
      return {
        cartItems: nextItems,
        subtotal: calcSubtotal(nextItems),
      };
    }),
  removeCartItem: (id) =>
    set((state) => {
      const nextItems = state.cartItems.filter((l) => l.id !== id);
      return {
        cartItems: nextItems,
        subtotal: calcSubtotal(nextItems),
      };
    }),
}));
