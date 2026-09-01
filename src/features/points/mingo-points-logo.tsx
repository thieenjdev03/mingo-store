import Image from 'next/image';

interface MingoPointsLogoProps {
  /** Kích thước qua utility (vd "size-11 sm:size-12"); ảnh fill theo container. */
  className?: string;
}

/** Badge Mingo Points: vòng tròn cam + chữ M nét cọ trắng, nền trong suốt (đã cắt nền từ ảnh brand). */
const BADGE_SRC = '/assets/mingo/mingo-points-badge.png';

/**
 * Logo Mingo Points — dùng badge brand thật (mingo-points-badge.png) đã cắt nền trong suốt.
 * `rounded-full overflow-hidden` giữ mép tròn gọn ở mọi kích thước.
 */
export function MingoPointsLogo({ className }: MingoPointsLogoProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative block shrink-0 overflow-hidden rounded-full shadow-[0_8px_18px_rgba(254,80,0,0.25)] ${className ?? ''}`}
    >
      <Image src={BADGE_SRC} alt="" fill sizes="48px" className="object-contain" />
    </span>
  );
}
