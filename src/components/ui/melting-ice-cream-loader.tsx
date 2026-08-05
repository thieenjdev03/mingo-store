import { cn } from '@/lib/utils';

type LoaderSize = 'sm' | 'md' | 'lg';

const sizeClass: Record<LoaderSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const svgSize: Record<LoaderSize, number> = { sm: 58, md: 82, lg: 112 };

interface MeltingIceCreamLoaderProps {
  label?: string;
  size?: LoaderSize;
  className?: string;
}

/** Loader nhận diện Mingo: cây kem tan chảy, tự dùng màu theme hiện tại. */
export function MeltingIceCreamLoader({
  label = 'Đang tải…',
  size = 'md',
  className,
}: MeltingIceCreamLoaderProps) {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center gap-2 text-muted-foreground', sizeClass[size], className)}>
      <svg
        width={svgSize[size]}
        height={svgSize[size] * 1.25}
        viewBox="0 0 120 150"
        fill="none"
        aria-hidden="true"
        className="mingo-loader-svg"
      >
        <g className="mingo-loader-sway">
          <path d="M37 78h46l-9 58H46L37 78Z" fill="var(--mingo-sand)" stroke="var(--mingo-orange-dark)" strokeWidth="3" strokeLinejoin="round" />
          <path d="m42 91 36 5M44 105l31 5M46 119l27 4M51 82l5 51M67 82l-5 51" stroke="var(--mingo-orange-dark)" strokeWidth="2" strokeLinecap="round" opacity=".55" />
          <path
            className="mingo-loader-scoop"
            d="M20 67c0-19 15-34 34-34 6-13 26-15 34-2 14 1 25 12 25 26 0 4-1 8-3 11-2 4-5 7-9 9l-1 16c0 5-7 7-10 2l-5-8-6 17c-2 5-9 4-10-1l-2-11-8 6c-4 3-9-1-8-6l2-10c-19 1-33-5-33-15Z"
            fill="var(--mingo-cream)"
            stroke="var(--mingo-orange)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M29 56c8-8 18-12 29-11M73 40c8 1 15 6 19 12" stroke="var(--mingo-coral)" strokeWidth="4" strokeLinecap="round" opacity=".8" />
          <circle cx="39" cy="47" r="3" fill="var(--mingo-orange)" />
          <circle cx="57" cy="39" r="3" fill="var(--mingo-butter)" />
          <circle cx="82" cy="52" r="3" fill="var(--mingo-coral)" />
        </g>
      </svg>
      <span>{label}</span>
    </div>
  );
}
