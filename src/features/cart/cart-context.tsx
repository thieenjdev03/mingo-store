'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getApiErrorMessage } from '@/lib/api/error-message';
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from './api';
import { CART_UPDATED_EVENT } from './cart-token';
import { EMPTY_CART, type CartView } from './types';

interface CartContextValue extends CartView {
  isLoading: boolean;
  isMutating: boolean;
  errorMessage: string | null;
  isDrawerOpen: boolean;
  addItem: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
  dismissError: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = useTranslations('cart');
  const [cart, setCart] = useState<CartView>(EMPTY_CART);
  const [isLoading, setLoading] = useState(true);
  const [isMutating, setMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setCart(await getCart(locale));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('loadError')));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    void refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CART_UPDATED_EVENT, refresh);
  }, [refresh]);

  const runMutation = useCallback(
    async (request: () => Promise<CartView>): Promise<boolean> => {
      setMutating(true);
      setErrorMessage(null);
      try {
        setCart(await request());
        return true;
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, t('updateError')));
        await refresh();
        return false;
      } finally {
        setMutating(false);
      }
    },
    [refresh, t],
  );

  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      const success = await runMutation(() =>
        addCartItem({ productId, quantity }, locale),
      );
      if (success) setDrawerOpen(true);
      return success;
    },
    [locale, runMutation],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      await runMutation(() => removeCartItem(itemId, locale));
    },
    [locale, runMutation],
  );

  const setQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      await runMutation(() => updateCartItem(itemId, { quantity }, locale));
    },
    [locale, runMutation],
  );

  const clear = useCallback(async () => {
    setMutating(true);
    setErrorMessage(null);
    try {
      await clearCart();
      setCart(EMPTY_CART);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('updateError')));
    } finally {
      setMutating(false);
    }
  }, [t]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...cart,
      isLoading,
      isMutating,
      errorMessage,
      isDrawerOpen,
      addItem,
      removeItem,
      setQuantity,
      clear,
      refresh,
      dismissError: () => setErrorMessage(null),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [
      addItem,
      cart,
      clear,
      errorMessage,
      isDrawerOpen,
      isLoading,
      isMutating,
      refresh,
      removeItem,
      setQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart phải dùng bên trong <CartProvider>');
  return context;
}
