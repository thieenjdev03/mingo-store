'use client';

import Image from 'next/image';
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import { useCart } from './cart-context';

export function CartPageContent() {
  const t = useTranslations('cart');
  const { items, subtotal, removeItem, setQuantity, clear } = useCart();

  return (
    <div className="bg-ivory py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mingo store</p>
            <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{t('title')}</h1>
          </div>
          {items.length ? <button type="button" onClick={clear} className="text-sm font-bold text-muted-foreground hover:text-destructive">{t('clear')}</button> : null}
        </div>

        {items.length === 0 ? (
          <section className="mt-8 flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-card px-6 text-center shadow-sm">
            <ShoppingBag className="size-14 text-muted-foreground" strokeWidth={1.25} aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-bold">{t('emptyTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('emptyPageDescription')}</p>
            <Link href="/products" className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">{t('continueShopping')}</Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-4 rounded-xl bg-card p-5 shadow-sm sm:p-7">
              {items.map((item) => (
                <article key={item.sku} className="flex gap-4 border-b border-border pb-5 last:border-0 last:pb-0 sm:gap-6">
                  <div className="relative size-24 shrink-0 rounded-lg bg-background sm:size-28">
                    {item.image ? <Image src={item.image} alt={item.name} fill sizes="112px" className="object-contain p-2" /> : <span className="flex h-full items-center justify-center text-3xl">🍦</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold">{item.name}</h2>
                        {item.variantLabel ? <p className="mt-1 text-sm text-muted-foreground">{item.variantLabel}</p> : null}
                      </div>
                      <button type="button" onClick={() => removeItem(item.sku)} aria-label={`${t('remove')} ${item.name}`} className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="size-4" aria-hidden="true" /></button>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center rounded-lg border border-border">
                        <button type="button" aria-label={t('decrease')} disabled={item.quantity <= 1} onClick={() => setQuantity(item.sku, item.quantity - 1)} className="p-2.5 disabled:opacity-35"><Minus className="size-4" aria-hidden="true" /></button>
                        <span className="min-w-9 text-center font-semibold">{item.quantity}</span>
                        <button type="button" aria-label={t('increase')} onClick={() => setQuantity(item.sku, item.quantity + 1)} className="p-2.5"><Plus className="size-4" aria-hidden="true" /></button>
                      </div>
                      <p className="text-lg font-bold text-primary">{fCurrencyVND(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-xl bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold">{t('summary')}</h2>
              <div className="mt-6 flex items-center justify-between border-b border-border pb-5">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="text-xl font-bold text-primary">{fCurrencyVND(subtotal)}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{t('shippingNote')}</p>
              <Link href="/checkout" className="mt-6 flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">{t('checkout')}</Link>
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{t('secureNote')}</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
