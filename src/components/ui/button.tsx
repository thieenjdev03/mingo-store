import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-bold uppercase tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-ring',
  {
    variants: {
      variant: {
        // CTA cam — "THÊM VÀO GIỎ HÀNG"
        default: 'bg-primary text-primary-foreground hover:bg-primary-dark',
        // "See Product" trên hero — viền, nền sáng
        outline: 'border-2 border-foreground bg-card text-foreground hover:bg-accent',
        ghost: 'text-foreground hover:bg-accent',
      },
      size: {
        default: 'h-12 px-6 text-sm',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        icon: 'size-10 rounded-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
