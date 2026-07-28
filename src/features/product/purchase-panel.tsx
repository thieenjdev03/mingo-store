'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fCurrencyVND } from '@/lib/format';
import { useCart } from '@/features/cart/cart-context';
import type { ProductDetailView } from './types';

export function PurchasePanel({ product }: { product: ProductDetailView }) {
  const t = useTranslations('product');
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const canBuy = product.purchasable && product.stock > 0;

  return (
    <div className="@container space-y-6">
      <p className="text-2xl font-bold text-primary">{fCurrencyVND(product.price)}</p>
      {cart.errorMessage ? <p className="rounded-lg bg-destructive/10 p-3 text-sm font-semibold text-destructive" role="alert">{cart.errorMessage}</p> : null}

      <div className="flex flex-col gap-3 @min-[25rem]:flex-row">
        <div className="flex w-fit shrink-0 items-center rounded-lg border-2 border-foreground/80 bg-card">
          <button type="button" aria-label={t('decreaseQuantity')} className="px-3 py-3 disabled:opacity-40" disabled={quantity <= 1 || cart.isMutating} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-8 text-center font-bold">{quantity}</span>
          <button type="button" aria-label={t('increaseQuantity')} className="px-3 py-3 disabled:opacity-40" disabled={quantity >= product.stock || cart.isMutating} onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}>
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>

        <Button className="min-w-0 flex-1 px-4 text-xs sm:px-6 sm:text-sm" onClick={() => void cart.addItem(product.id, quantity)} disabled={!canBuy || cart.isMutating}>
          {canBuy ? `${fCurrencyVND(product.price * quantity)} | ${t('addToCart')}` : t('outOfStock')}
        </Button>
      </div>
    </div>
  );
}
