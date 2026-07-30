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
  const selectedLabel = product.variants[0]?.label ?? product.spec;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-y border-[#e5beb2]/30 py-[17px] text-[#563e2b]">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-[#5e5c50]">
            <span className="size-2.5 rounded-full bg-[#5e5c50]" />
          </span>
          <span className="truncate text-[16px] font-bold uppercase leading-6 lg:text-[24px]">
            {selectedLabel || '—'}
          </span>
        </div>
        <p className="shrink-0 pl-4 text-[20px] font-extrabold leading-5 text-black lg:text-[24px]">
          {fCurrencyVND(product.price)}
        </p>
      </div>

      <div className="grid grid-cols-[146px_minmax(0,1fr)] items-center gap-4 lg:grid-cols-[130px_minmax(0,1fr)] lg:gap-[10px]">
        <div className="flex h-12 min-w-0 items-center justify-between rounded-lg border border-[#563e2b] bg-transparent px-1 lg:rounded-[5px]">
          <button type="button" aria-label={t('decreaseQuantity')} className="grid size-10 place-items-center disabled:opacity-40" disabled={quantity <= 1 || cart.isMutating} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-8 text-center text-[18px] font-bold">{quantity}</span>
          <button type="button" aria-label={t('increaseQuantity')} className="grid size-10 place-items-center disabled:opacity-40" disabled={quantity >= product.stock || cart.isMutating} onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}>
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>

        <Button className="h-12 min-w-0 rounded-lg px-2 text-[10px] tracking-normal sm:text-xs lg:rounded-[5px] lg:text-[16px]" onClick={() => void cart.addItem(product.id, quantity)} disabled={!canBuy || cart.isMutating}>
          {canBuy ? `${fCurrencyVND(product.price * quantity)} | ${t('addToCart')}` : t('outOfStock')}
        </Button>
      </div>
    </div>
  );
}
