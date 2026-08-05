'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fCurrencyVND } from '@/lib/format';
import { useCart } from '@/features/cart/cart-context';
import { discountPercent, type ProductDetailView } from './types';

export function PurchasePanel({ product }: { product: ProductDetailView }) {
  const t = useTranslations('product');
  const cart = useCart();
  const hasVariants = product.variants.length > 0;
  const [selectedSku, setSelectedSku] = useState<string | null>(() => product.variants[0]?.sku ?? null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = hasVariants
    ? product.variants.find((v) => v.sku === selectedSku) ?? product.variants[0]
    : undefined;

  const unitPrice = selectedVariant?.price ?? product.price;
  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
  const canBuy = selectedVariant ? selectedVariant.inStock : product.purchasable && product.stock > 0;
  // Khi bật nhãn giảm giá, compareAtPrice = giá gốc; hiện giá gốc gạch + % giảm.
  const salePercent = discountPercent(product.price, product.compareAtPrice);

  const selectVariant = (sku: string) => {
    setSelectedSku(sku);
    setQuantity(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[26px] font-extrabold leading-none text-primary lg:text-[32px]">
          {fCurrencyVND(product.price)}
        </span>
        {product.compareAtPrice ? (
          <>
            <span className="text-[16px] text-muted-foreground line-through lg:text-[18px]">
              {fCurrencyVND(product.compareAtPrice)}
            </span>
            {salePercent != null ? (
              <span className="rounded-md bg-red-100 px-2 py-0.5 text-[13px] font-bold text-red-600">
                -{salePercent}%
              </span>
            ) : null}
          </>
        ) : null}
      </div>
      {hasVariants ? (
        <div className="border-y border-[#e5beb2]/30 py-4">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#563e2b]/70">{t('variants')}</p>
          <div className="space-y-2" role="radiogroup" aria-label={t('variants')}>
            {product.variants.map((variant) => {
              const selected = variant.sku === selectedVariant?.sku;
              return (
                <button
                  key={variant.sku}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!variant.inStock || cart.isMutating}
                  onClick={() => selectVariant(variant.sku)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? 'border-[#563e2b] bg-[#563e2b]/[0.06]'
                      : 'border-[#e5beb2]/60 hover:border-[#563e2b]/50'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                        selected ? 'border-[#563e2b]' : 'border-[#b8a99a]'
                      }`}
                    >
                      {selected ? <span className="size-2.5 rounded-full bg-[#563e2b]" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-bold uppercase leading-5 text-[#563e2b] lg:text-[18px]">
                        {variant.label}
                      </span>
                      <span className={`block text-xs ${variant.inStock ? 'text-emerald-700' : 'text-destructive'}`}>
                        {variant.inStock ? t('availableCount', { count: variant.stock }) : t('outOfStock')}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[16px] font-extrabold text-black lg:text-[18px]">
                    {fCurrencyVND(variant.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center border-y border-[#e5beb2]/30 py-[17px] text-[#563e2b]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-[#5e5c50]">
              <span className="size-2.5 rounded-full bg-[#5e5c50]" />
            </span>
            <span className="truncate text-[16px] font-bold uppercase leading-6 lg:text-[24px]">
              {product.spec || '—'}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[146px_minmax(0,1fr)] items-center gap-4 lg:grid-cols-[130px_minmax(0,1fr)] lg:gap-[10px]">
        <div className="flex h-12 min-w-0 items-center justify-between rounded-lg border border-[#563e2b] bg-transparent px-1 lg:rounded-[5px]">
          <button type="button" aria-label={t('decreaseQuantity')} className="grid size-10 place-items-center disabled:opacity-40" disabled={quantity <= 1 || cart.isMutating} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-8 text-center text-[18px] font-bold">{quantity}</span>
          <button type="button" aria-label={t('increaseQuantity')} className="grid size-10 place-items-center disabled:opacity-40" disabled={quantity >= maxStock || cart.isMutating} onClick={() => setQuantity((current) => Math.min(maxStock, current + 1))}>
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>

        <Button className="h-12 min-w-0 rounded-lg px-2 text-[10px] tracking-normal sm:text-xs lg:rounded-[5px] lg:text-[16px]" onClick={() => void cart.addItem(product.id, quantity)} disabled={!canBuy || cart.isMutating}>
          {canBuy ? `${fCurrencyVND(unitPrice * quantity)} | ${t('addToCart')}` : t('outOfStock')}
        </Button>
      </div>
    </div>
  );
}
