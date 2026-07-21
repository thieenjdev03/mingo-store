'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { ShowcaseProduct } from '@/config/mingo-home-content';

export function ProductCarousel({ products }: { products: ShowcaseProduct[] }) {
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
        className="absolute left-1 top-[46%] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground transition disabled:opacity-40 sm:-left-12 lg:-left-20 lg:top-[172px]"
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
            className="group block min-w-0 shrink-0 basis-[82%] snap-start text-center sm:basis-[48%] lg:basis-[calc(25%-18px)]"
          >
            <div className="relative mx-auto h-[330px] w-full sm:h-[390px] lg:h-[376px]">
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                sizes="(max-width: 640px) 82vw, (max-width: 1024px) 48vw, 282px"
                className="object-contain transition-transform duration-300 motion-reduce:transition-none group-hover:-translate-y-2 group-hover:scale-[1.02]"
              />
            </div>
            <h3 className="mt-12 text-[24px] font-semibold leading-7 text-[#563e2b] transition-colors group-hover:text-primary lg:text-[32px] lg:leading-6">
              {product.name}
            </h3>
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="Sản phẩm tiếp theo"
        disabled={!canGoForward}
        onClick={() => move(1)}
        className="absolute right-1 top-[46%] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground transition disabled:opacity-40 sm:-right-12 lg:-right-20 lg:top-[172px]"
      >
        <ChevronRight className="size-8" strokeWidth={1.25} />
      </button>
    </div>
  );
}
