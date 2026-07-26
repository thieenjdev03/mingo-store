'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Toast as ToastPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (opts: { title: string; description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Toast dùng chung trong khu admin. Bọc ở admin root layout. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback<ToastContextValue['toast']>(({ title, description, tone = 'info' }) => {
    setItems((prev) => [...prev, { id: Date.now() + Math.floor(performance.now()), title, description, tone }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            duration={4000}
            onOpenChange={(open) => {
              if (!open) setItems((prev) => prev.filter((t) => t.id !== item.id));
            }}
            className={cn(
              'flex flex-col gap-1 rounded-lg border-l-4 bg-white p-4 shadow-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full',
              item.tone === 'success' && 'border-green-500',
              item.tone === 'error' && 'border-red-500',
              item.tone === 'info' && 'border-blue-500',
            )}
          >
            <ToastPrimitive.Title className="text-sm font-bold text-foreground">{item.title}</ToastPrimitive.Title>
            {item.description ? (
              <ToastPrimitive.Description className="text-sm text-muted-foreground">
                {item.description}
              </ToastPrimitive.Description>
            ) : null}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-[380px] max-w-[100vw] flex-col gap-2 p-6 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
