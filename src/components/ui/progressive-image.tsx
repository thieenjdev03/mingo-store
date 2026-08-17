'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

type ProgressiveImageProps = ImageProps & {
  skeletonClassName?: string;
};

/**
 * Ảnh lazy có nền shimmer màu kem trong lúc chờ và fade nhẹ khi decode xong.
 * Component không bọc thêm div, vì vậy dùng được trực tiếp với `fill` trong
 * container `relative` hiện có của product/brand card.
 */
export function ProgressiveImage({
  className,
  skeletonClassName,
  onLoad,
  onError,
  ...props
}: ProgressiveImageProps) {
  const [settled, setSettled] = useState(false);

  return (
    <>
      {!settled ? (
        <span
          className={`mingo-image-skeleton pointer-events-none absolute inset-0 ${skeletonClassName ?? ''}`}
          aria-hidden="true"
        />
      ) : null}
      <Image
        {...props}
        className={`${className ?? ''} transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${settled ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.985]'}`}
        onLoad={(event) => {
          setSettled(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setSettled(true);
          onError?.(event);
        }}
      />
    </>
  );
}
