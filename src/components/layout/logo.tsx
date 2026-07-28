import Image from 'next/image';
import { cn } from '@/lib/utils';

export const LOGO_SRC = '/assets/mingo/home/mingo-logo.png';

interface LogoProps {
  /** Chiều cao logo (px). Rộng tự co theo tỉ lệ ảnh. */
  height?: number;
  priority?: boolean;
  className?: string;
}

/**
 * Logo Mingo. Dùng thay cho mọi chỗ trước đây render chữ "Mingo" màu cam.
 * Ảnh có `width/height` thật nên không gây layout shift lúc tải.
 */
export function Logo({ height = 32, priority = false, className }: LogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Mingo"
      width={height}
      height={height}
      priority={priority}
      className={cn('w-auto object-contain', className)}
      style={{ height }}
    />
  );
}
