'use client';

/**
 * Cart tầng client: Context + reducer, persist localStorage.
 * Nâng cấp so với repo cũ (cart chỉ sống trong memory).
 * TODO(checkout): port onValidateAndRefreshCart từ repo cũ — validate tồn kho
 * với server TRƯỚC bước thanh toán, không tin snapshot phía client.
 */
import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import type { CartAction, CartItem, CartState } from './types';

const STORAGE_KEY = 'mingo-cart-v1';
const EMPTY: CartState = { items: [] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'ADD': {
      const existing = state.items.find((i) => i.sku === action.item.sku);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.sku === action.item.sku ? { ...i, quantity: i.quantity + action.item.quantity } : i,
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.sku !== action.sku) };
    case 'SET_QTY':
      return {
        items: state.items
          .map((i) => (i.sku === action.sku ? { ...i, quantity: action.quantity } : i))
          .filter((i) => i.quantity > 0),
      };
    case 'CLEAR':
      return EMPTY;
  }
}

interface CartContextValue extends CartState {
  totalQuantity: number;
  subtotal: number;
  isDrawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  setQuantity: (sku: string, quantity: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Hydrate sau mount để tránh mismatch SSR
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'HYDRATE', state: JSON.parse(raw) as CartState });
    } catch {
      /* localStorage hỏng -> bỏ qua, giỏ rỗng */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota/private mode -> bỏ qua */
    }
  }, [state]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      totalQuantity: state.items.reduce((s, i) => s + i.quantity, 0),
      subtotal: state.items.reduce((s, i) => s + i.price * i.quantity, 0),
      isDrawerOpen,
      addItem: (item) => dispatch({ type: 'ADD', item }),
      removeItem: (sku) => dispatch({ type: 'REMOVE', sku }),
      setQuantity: (sku, quantity) => dispatch({ type: 'SET_QTY', sku, quantity }),
      clear: () => dispatch({ type: 'CLEAR' }),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [isDrawerOpen, state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng bên trong <CartProvider>');
  return ctx;
}
