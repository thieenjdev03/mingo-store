'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useProductVariantSelection } from './product-variant-selection';
import { PRODUCT_PLACEHOLDER_IMAGE, type ProductVariantView } from './types';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  variants: ProductVariantView[];
}

/** PDP gallery: đổi theo thumbnail hoặc ảnh của biến thể vừa chọn. */
export function ProductGallery({ images, productName, variants }: ProductGalleryProps) {
  const { selectedSku } = useProductVariantSelection();
  const selectedVariant = variants.find((variant) => variant.sku === selectedSku);
  const variantImage = selectedVariant?.image ?? null;
  const fallbackImage = images[0] ?? PRODUCT_PLACEHOLDER_IMAGE;
  const galleryImages = useMemo(
    () => Array.from(new Set([...images, ...variants.flatMap((variant) => variant.image ? [variant.image] : [])])),
    [images, variants],
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(variantImage ?? fallbackImage);

  useEffect(() => {
    setSelectedImage(variantImage ?? fallbackImage);
  }, [variantImage, fallbackImage]);

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
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <div className="flex max-w-full shrink-0 gap-2 overflow-x-auto px-4 pb-1" aria-label={productName}>
          {galleryImages.map((image, index) => {
            const selected = image === selectedImage;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`${productName} ${index + 1}`}
                aria-pressed={selected}
                onClick={() => setSelectedImage(image)}
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
