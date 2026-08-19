'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import { useCart } from '@/features/cart/cart-context';
import { discountPercent, type ProductDetailView } from './types';

export function PurchasePanel({ product }: { product: ProductDetailView }) {
  const t = useTranslations('product');
  const cart = useCart();
  const initialSelectedSku = product.variants.find((variant) => variant.inStock)?.sku ?? product.variants[0]?.sku ?? null;
  const [selectedSku, setSelectedSku] = useState<string | null>(initialSelectedSku);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.hasVariants
    ? product.variants.find((v) => v.sku === selectedSku)
    : undefined;

  const unitPrice = selectedVariant?.price ?? product.price;
  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
  const canBuy = product.hasVariants
    ? Boolean(selectedVariant?.inStock)
    : product.purchasable && product.stock > 0;
  // Khi bật nhãn giảm giá, compareAtPrice = giá gốc; hiện giá gốc gạch + % giảm.
  const salePercent = discountPercent(product.price, product.compareAtPrice);

  const selectVariant = (sku: string) => {
    setSelectedSku(sku);
    setQuantity(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {product.isContactForPrice ? (
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[18px] font-extrabold leading-none text-primary lg:text-[20px]">
            {t('contactForPrice')}
          </span>
        ) : (
          <>
            {selectedVariant ? (
              <span className="text-[26px] font-extrabold leading-none text-primary lg:text-[32px]">
                {fCurrencyVND(selectedVariant.price)}
              </span>
            ) : !product.hasVariants ? (
              <span className="text-[26px] font-extrabold leading-none text-primary lg:text-[32px]">
                {fCurrencyVND(product.price)}
              </span>
            ) : null}
            {!product.hasVariants && product.compareAtPrice ? (
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
          </>
        )}
        {product.isOutOfStock && !product.isContactForPrice ? (
          <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold text-muted-foreground">
            {t('contactForPrice')}
          </span>
        ) : null}
      </div>
      {product.hasVariants ? (
        <div className="border-y border-[#e5beb2]/30" role="radiogroup" aria-label={t('variants')}>
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
                className={`grid min-h-16 w-full grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e5beb2]/30 px-1 text-left transition-colors last:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through sm:px-2 ${
                  selected ? 'bg-primary/[0.04]' : 'hover:bg-primary/[0.03]'
                }`}
              >
                <span
                  className={`grid size-[22px] place-items-center rounded-full border border-[#6b4a31] ${
                    selected ? 'border-2 border-[#563e2b]' : ''
                  }`}
                  aria-hidden="true"
                >
                  {selected ? <span className="size-2.5 rounded-full bg-[#563e2b]" /> : null}
                </span>
                <span className="min-w-0 truncate text-[14px] font-bold  leading-6 text-[#563e2b] lg:text-[19px]">
                  {variant.label}{variant.packLabel ? ` - ${variant.packLabel}` : ''}
                </span>
                <span className="shrink-0 text-[14px] font-bold leading-6 text-[#563e2b] lg:text-[19px]">
                  {fCurrencyVND(variant.price)}
                </span>
              </button>
            );
          })}
          {product.isOutOfStock ? (
            <span className="block border-t border-[#e5beb2]/30 px-1 py-3 text-right text-sm font-semibold text-muted-foreground sm:px-2">
              {t('productTemporarilyOutOfStock')}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 border-y border-[#e5beb2]/30 py-[17px] text-[#563e2b]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-[#5e5c50]">
              <span className="size-2.5 rounded-full bg-[#5e5c50]" />
            </span>
            <span className="truncate text-[16px] font-bold uppercase leading-6 lg:text-[24px]">
              {product.spec || '—'}
            </span>
          </div>
          {product.isOutOfStock ? (
            <span className="shrink-0 text-sm font-semibold text-muted-foreground">
              {t('productTemporarilyOutOfStock')}
            </span>
          ) : null}
        </div>
      )}

      {product.isOutOfStock || !product.purchasable ? (
        <div className="flex h-12 w-full items-center justify-center rounded-lg bg-muted px-4 text-sm font-bold text-muted-foreground lg:rounded-[5px] lg:text-base">
          {product.isOutOfStock ? t('productTemporarilyOutOfStock') : t('outOfStock')}
        </div>
      ) : product.isContactForPrice ? (
        <Button asChild className="h-12 w-full rounded-lg text-sm lg:rounded-[5px] lg:text-[16px]">
          <Link href="/contact">{t('contactForPrice')}</Link>
        </Button>
      ) : (
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

          <Button className="h-12 min-w-0 rounded-lg px-2 text-[10px] tracking-normal sm:text-xs lg:rounded-[5px] lg:text-[16px]" onClick={() => void cart.addItem(product.id, quantity, selectedVariant?.sku)} disabled={!canBuy || cart.isMutating}>
            {canBuy ? `${fCurrencyVND(unitPrice * quantity)} | ${t('addToCart')}` : t('outOfStock')}
          </Button>
        </div>
      )}
    </div>
  );
}
