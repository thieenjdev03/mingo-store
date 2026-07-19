import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {}

/** Pill trắng theo mockup PDP: "Dessert Collection", "Kem que" */
export function Chip({ className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-card px-3 py-1 text-sm font-semibold text-foreground',
        className,
      )}
      {...props}
    />
  );
}
