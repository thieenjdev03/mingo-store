'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { ProductCardView } from '@/features/product/types';
import { fCurrencyVND } from '@/lib/format';
import { useTranslations } from 'next-intl';
import { ProgressiveImage } from '@/components/ui/progressive-image';

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
        className="absolute left-1 top-[46%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground transition disabled:opacity-40 sm:grid lg:top-[172px] min-[1360px]:-left-20"
      >
        <ChevronLeft className="size-8" strokeWidth={1.25} />
      </button>

      {/* Mobile: lưới 2 cột, không cuộn ngang (theo design). Từ sm trở lên chuyển sang carousel cuộn ngang. */}
      <div
        ref={trackRef}
        onScroll={updateControls}
        className="no-scrollbar grid grid-cols-2 gap-x-4 gap-y-8 px-4 sm:flex sm:snap-x sm:snap-mandatory sm:gap-6 sm:overflow-x-auto sm:px-0 sm:pb-2"
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group block min-w-0 text-left sm:shrink-0 sm:basis-[48%] sm:snap-start lg:basis-[calc(25%-18px)]"
          >
            <div className="relative mx-auto h-[210px] w-full sm:h-[390px] lg:h-[376px]">
              {product.image ? (
                <ProgressiveImage
                  src={product.image}
                  alt={product.name}
                  fill
                  loading="lazy"
                  quality={70}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 48vw, 282px"
                  className="object-contain transition-transform duration-300 motion-reduce:transition-none group-hover:-translate-y-2 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg bg-muted text-5xl text-muted-foreground">
                  🍦
                </div>
              )}
            </div>
            <h3 className="mt-4 line-clamp-2 min-h-12 font-sans text-base font-bold leading-6 text-[#563e2b] transition-colors group-hover:text-primary sm:mt-10 sm:min-h-14 sm:text-[24px] sm:leading-7 lg:mt-12 lg:min-h-[4.5rem] lg:text-[32px] lg:leading-9 text-center">
              {product.name}
            </h3>
            {product.available ? (
              <div className="mt-2 flex min-h-6 items-baseline text-center justify-between gap-2 text-xs font-light leading-6 text-[#563e2b] sm:mt-5 sm:gap-3 sm:text-[14px]">
                {!product.specOutOfStock ? <span className="truncate">{product.spec ?? ''}</span> : <span />}
                {product.specOutOfStock ? (
                <span className="shrink-0 font-semibold text-muted-foreground">{t('temporarilyOutOfStock')}</span>
                ) : (
                  <>
                    <span className="shrink-0">{fCurrencyVND(product.price)}</span>
                    {product.compareAtPrice ? <span className="text-sm text-muted-foreground line-through">{fCurrencyVND(product.compareAtPrice)}</span> : null}
                  </>
                )}
              </div>
            ) : (
              <p className="mt-2 min-h-6 text-sm font-semibold leading-6 text-primary-dark text-center">{t('contactForInfo')}</p>
            )}
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="Sản phẩm tiếp theo"
        disabled={!canGoForward}
        onClick={() => move(1)}
        className="absolute right-1 top-[46%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground transition disabled:opacity-40 sm:grid lg:top-[172px] min-[1360px]:-right-20"
      >
        <ChevronRight className="size-8" strokeWidth={1.25} />
      </button>
    </div>
  );
}
