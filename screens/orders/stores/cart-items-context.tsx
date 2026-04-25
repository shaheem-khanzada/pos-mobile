import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CartItem } from '@/payload/types';

type CartItemsContextValue = {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

const CartItemsContext = createContext<CartItemsContextValue | null>(null);

export function CartItemsProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const value = useMemo(() => ({ cartItems, setCartItems }), [cartItems]);

  return (
    <CartItemsContext.Provider value={value}>
      {children}
    </CartItemsContext.Provider>
  );
}

export function useCartItems() {
  const ctx = useContext(CartItemsContext);
  if (!ctx) {
    throw new Error('useCartItems must be used within CartItemsProvider');
  }
  return ctx;
}
