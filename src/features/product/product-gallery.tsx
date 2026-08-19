'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

/** PDP gallery: the main image always reflects the thumbnail the customer selected. */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0] ?? null;

  return (
    <div className="flex h-[450px] w-full flex-col items-center justify-center gap-4 overflow-hidden bg-[radial-gradient(circle_at_center,#fff1e8_0%,rgba(255,241,232,0)_70%)] lg:aspect-[3/4] lg:h-auto lg:bg-none">
      <div className="relative min-h-0 flex-1 w-full">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={productName}
            fill
            sizes="(max-width: 1023px) 282px, 588px"
            className="object-contain"
            priority
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-xl bg-muted text-6xl" aria-label={productName}>
            🍦
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="flex max-w-full shrink-0 gap-2 overflow-x-auto px-4 pb-1" aria-label={productName}>
          {images.map((image, index) => {
            const selected = index === selectedIndex;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`${productName} ${index + 1}`}
                aria-pressed={selected}
                onClick={() => setSelectedIndex(index)}
                className={`relative size-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:size-16 ${
                  selected ? 'border-primary' : 'border-border hover:border-primary/60'
                }`}
              >
                <Image src={image} alt="" fill sizes="64px" className="object-contain" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
