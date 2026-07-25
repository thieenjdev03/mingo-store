'use client';

/**
 * Khối mua hàng bên phải PDP theo mockup:
 * radio quy cách (variant) + stepper số lượng + CTA "100.000Đ | THÊM VÀO GIỎ HÀNG".
 * Trục variant duy nhất = quy cách đóng gói (xem mingo-pdp-frontend-plan.md §0.1).
 */
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fCurrencyVND } from '@/lib/format';
import { useCart } from '@/features/cart/cart-context';
import type { ProductDetailView } from './types';

export interface PurchasePanelProps {
  product: ProductDetailView;
}

export function PurchasePanel({ product }: PurchasePanelProps) {
  const t = useTranslations('product');
  const { addItem, openDrawer } = useCart();

  const firstInStock = product.variants.find((v) => v.inStock) ?? product.variants[0] ?? null;
  const [selectedSku, setSelectedSku] = useState<string | null>(firstInStock?.sku ?? null);
  const [quantity, setQuantity] = useState(1);

  const selected = useMemo(
    () => product.variants.find((v) => v.sku === selectedSku) ?? null,
    [product.variants, selectedSku],
  );

  const unitPrice = selected?.price ?? product.price;
  const maxQty = selected?.stock ?? 99;
  const canBuy = product.purchasable && (selected ? selected.inStock : true);

  function handleAdd() {
    addItem({
      productId: product.id,
      sku: selected?.sku ?? product.id,
      name: product.name,
      variantLabel: selected?.label ?? null,
      image: product.image,
      price: unitPrice,
      quantity,
    });
    openDrawer();
  }

  return (
    <div className="@container space-y-6">
      {/* Radio quy cách */}
      {product.variants.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="sr-only">{t('addToCart')}</legend>
          {product.variants.map((v) => (
            <label
              key={v.sku}
              className="flex cursor-pointer items-center justify-between gap-4 py-1.5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
            >
              <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 font-bold uppercase tracking-wide">
                <input
                  type="radio"
                  name="variant"
                  value={v.sku}
                  checked={selectedSku === v.sku}
                  onChange={() => {
                    setSelectedSku(v.sku);
                    setQuantity(1);
                  }}
                  disabled={!v.inStock}
                  className="size-4 accent-[var(--color-primary)]"
                />
                {v.label}
                {!v.inStock && <span className="text-xs font-semibold text-muted-foreground">({t('outOfStock')})</span>}
              </span>
              <span className="shrink-0 font-bold">{fCurrencyVND(v.price)}</span>
            </label>
          ))}
        </fieldset>
      )}

      {/* Stepper + CTA */}
      {/* CTA label ("100.000Đ | THÊM VÀO GIỎ HÀNG") is nowrap → stack below the stepper
          whenever the panel itself is too narrow. Container query, not viewport: the
          panel is a 55% PDP column on tablet, far narrower than the screen. */}
      <div className="flex flex-col gap-3 @min-[25rem]:flex-row">
        <div className="flex w-fit shrink-0 items-center rounded-lg border-2 border-foreground/80 bg-card">
          <button
            type="button"
            aria-label="Giảm số lượng"
            className="px-3 py-3 disabled:opacity-40"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-8 text-center font-bold">{quantity}</span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            className="px-3 py-3 disabled:opacity-40"
            disabled={quantity >= maxQty}
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
          >
            <Plus className="size-4" />
          </button>
        </div>

        <Button className="min-w-0 flex-1 px-4 text-xs sm:px-6 sm:text-sm" onClick={handleAdd} disabled={!canBuy}>
          {canBuy ? `${fCurrencyVND(unitPrice * quantity)} | ${t('addToCart')}` : t('outOfStock')}
        </Button>
      </div>
    </div>
  );
}
