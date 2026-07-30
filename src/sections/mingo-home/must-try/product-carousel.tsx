'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { ProductCardView } from '@/features/product/types';
import { fCurrencyVND } from '@/lib/format';
import { useTranslations } from 'next-intl';

export function ProductCarousel({ products }: { products: ProductCardView[] }) {
  const t = useTranslations('product');
  const trackRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanGoBack(track.scrollLeft > 2);
    setCanGoForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateControls();
    const observer = new ResizeObserver(updateControls);
    observer.observe(track);
    return () => observer.disconnect();
  }, [updateControls]);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.82, behavior: 'smooth' });
  };

  return (
    <div className="relative -mx-4 sm:mx-0">
      <button
        type="button"
        aria-label="Sản phẩm trước"
        disabled={!canGoBack}
        onClick={() => move(-1)}
        className="absolute left-1 top-[46%] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground transition disabled:opacity-40 lg:top-[172px] min-[1360px]:-left-20"
      >
        <ChevronLeft className="size-8" strokeWidth={1.25} />
      </button>

      <div
        ref={trackRef}
        onScroll={updateControls}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:gap-6 sm:px-0 lg:gap-6"
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group block min-w-0 shrink-0 basis-[82%] snap-start text-left sm:basis-[48%] lg:basis-[calc(25%-18px)]"
          >
            <div className="relative mx-auto h-[330px] w-full sm:h-[390px] lg:h-[376px]">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 48vw, 282px"
                  className="object-contain transition-transform duration-300 motion-reduce:transition-none group-hover:-translate-y-2 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg bg-muted text-5xl text-muted-foreground">
                  🍦
                </div>
              )}
            </div>
            <h3 className="mt-6 text-[22px] font-bold leading-7 text-[#563e2b] transition-colors group-hover:text-primary sm:mt-10 sm:text-[24px] lg:mt-12 lg:text-[32px] lg:leading-6">
              {product.name}
            </h3>
            <div className="mt-5 flex min-h-6 items-baseline justify-between gap-3 text-[14px] font-light leading-6 text-[#563e2b]">
              <span className="truncate">{product.spec ?? ''}</span>
              <span className="shrink-0">{fCurrencyVND(product.price)}</span>
              {product.compareAtPrice ? <span className="text-sm text-muted-foreground line-through">{fCurrencyVND(product.compareAtPrice)}</span> : null}
            </div>
            {!product.available ? <p className="mt-1 text-xs font-bold uppercase tracking-wide text-destructive">{t('outOfStock')}</p> : null}
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="Sản phẩm tiếp theo"
        disabled={!canGoForward}
        onClick={() => move(1)}
        className="absolute right-1 top-[46%] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground transition disabled:opacity-40 lg:top-[172px] min-[1360px]:-right-20"
      >
        <ChevronRight className="size-8" strokeWidth={1.25} />
      </button>
    </div>
  );
}
