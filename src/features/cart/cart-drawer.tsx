'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import { useCart } from './cart-context';

export function CartDrawer() {
  const t = useTranslations('cart');
  const { items, subtotal, isDrawerOpen, closeDrawer, removeItem, setQuantity } = useCart();

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeDrawer, isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
      <button
        type="button"
        aria-label={t('close')}
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[1px]"
        onClick={closeDrawer}
      />
      <aside
        aria-label={t('drawerTitle')}
        aria-modal="true"
        role="dialog"
        className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-foreground">{t('drawerTitle')}</h2>
          </div>
          <button type="button" onClick={closeDrawer} aria-label={t('close')} className="rounded-full p-2 hover:bg-muted">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="mb-5 size-12 text-muted-foreground" strokeWidth={1.25} aria-hidden="true" />
            <h3 className="font-display text-2xl font-bold">{t('emptyTitle')}</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t('emptyDescription')}</p>
            <Link href="/products" onClick={closeDrawer} className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">
              {t('continueShopping')}
            </Link>
          </div>
        ) : (
          <>
            <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
              {items.map((item) => (
                <article key={item.sku} className="flex gap-4 border-b border-border pb-4 last:border-0">
                  <div className="relative size-20 shrink-0 rounded-lg bg-background">
                    {item.image ? <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-1" /> : <span className="flex h-full items-center justify-center text-2xl">🍦</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold leading-5">{item.name}</h3>
                        {item.variantLabel ? <p className="mt-1 text-xs text-muted-foreground">{item.variantLabel}</p> : null}
                      </div>
                      <button type="button" onClick={() => removeItem(item.sku)} aria-label={`${t('remove')} ${item.name}`} className="rounded p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-md border border-border">
                        <button type="button" aria-label={t('decrease')} disabled={item.quantity <= 1} onClick={() => setQuantity(item.sku, item.quantity - 1)} className="p-1.5 disabled:opacity-35"><Minus className="size-3.5" aria-hidden="true" /></button>
                        <span className="min-w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <button type="button" aria-label={t('increase')} onClick={() => setQuantity(item.sku, item.quantity + 1)} className="p-1.5"><Plus className="size-3.5" aria-hidden="true" /></button>
                      </div>
                      <p className="font-bold text-primary">{fCurrencyVND(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="space-y-3 border-t border-border px-5 py-5 sm:px-7">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>{t('subtotal')}</span>
                <span className="text-primary">{fCurrencyVND(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('shippingNote')}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/cart" onClick={closeDrawer} className="inline-flex h-11 items-center justify-center rounded-lg border-2 border-foreground px-4 text-sm font-bold transition-colors hover:bg-accent">{t('viewCart')}</Link>
                <Link href="/checkout" onClick={closeDrawer} className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">{t('checkout')}</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
