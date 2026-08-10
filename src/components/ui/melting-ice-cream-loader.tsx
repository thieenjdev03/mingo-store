import Image from 'next/image';
import { cn } from '@/lib/utils';

type LoaderSize = 'sm' | 'md' | 'lg';

const sizeClass: Record<LoaderSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/** Kích thước ảnh mascot (px) theo size. */
const mascotSize: Record<LoaderSize, number> = { sm: 64, md: 96, lg: 140 };

interface MingoMascotLoaderProps {
  label?: string;
  size?: LoaderSize;
  className?: string;
}

/**
 * Loader nhận diện Mingo: mascot cắt nền nhún nhẹ + bóng đổ "thở" theo.
 * Dùng chung cho mọi trạng thái tải của website (route loading, dialog, list…).
 */
export function MingoMascotLoader({
  label = 'Đang tải…',
  size = 'md',
  className,
}: MingoMascotLoaderProps) {
  const px = mascotSize[size];
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 text-muted-foreground', sizeClass[size], className)}
    >
      <div className="relative flex flex-col items-center" style={{ width: px }}>
        <Image
          src="/assets/mingo/mascot.png"
          alt=""
          width={px}
          height={Math.round(px * 0.72)}
          priority
          className="mingo-mascot-bob h-auto w-full select-none"
        />
        {/* Bóng đổ dưới chân mascot, co giãn ngược pha với cú nhún. */}
        <span
          aria-hidden="true"
          className="mingo-mascot-shadow mt-1 block rounded-[50%] bg-foreground/30"
          style={{ width: px * 0.6, height: Math.max(4, px * 0.06) }}
        />
      </div>
      {label ? <span>{label}</span> : null}
    </div>
  );
}

/**
 * Alias tương thích ngược: tên cũ vẫn tồn tại cho các chỗ đang import,
 * nhưng nay render mascot Mingo thay cho cây kem SVG cũ.
 */
export const MeltingIceCreamLoader = MingoMascotLoader;
