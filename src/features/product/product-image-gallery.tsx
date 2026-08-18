'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const t = useTranslations('product');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? null;
  const hasMultipleImages = images.length > 1;

  function selectPrevious() {
    setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function selectNext() {
    setSelectedIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  return (
    <section className="w-full" aria-label={t('imageGallery')}>
      <div className="flex flex-col-reverse gap-3 lg:grid lg:grid-cols-[76px_minmax(0,1fr)] lg:gap-4">
        {hasMultipleImages ? (
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:max-h-[784px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={t('selectImage', { number: index + 1 })}
                aria-pressed={selectedIndex === index}
                className={`relative size-[72px] shrink-0 overflow-hidden rounded-md bg-card transition-colors ${
                  selectedIndex === index
                    ? 'border-2 border-primary'
                    : 'border border-border hover:border-primary'
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,var(--color-blush)_0%,transparent_70%)]">
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={`${productName} - ${t('imageNumber', { number: selectedIndex + 1 })}`}
              fill
              sizes="(max-width: 1023px) 100vw, 496px"
              className="object-contain p-5 sm:p-8"
              priority={selectedIndex === 0}
            />
          ) : (
            <span className="text-6xl" role="img" aria-label={productName}>🍦</span>
          )}

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={selectPrevious}
                aria-label={t('previousImage')}
                className="absolute left-3 grid size-10 place-items-center rounded-full bg-card/90 text-foreground shadow-sm transition-colors hover:bg-card hover:text-primary"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={selectNext}
                aria-label={t('nextImage')}
                className="absolute right-3 grid size-10 place-items-center rounded-full bg-card/90 text-foreground shadow-sm transition-colors hover:bg-card hover:text-primary"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-foreground/75 px-3 py-1 text-xs font-semibold text-card">
                {selectedIndex + 1}/{images.length}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
