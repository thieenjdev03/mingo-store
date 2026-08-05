import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({ id, label, required = true, error, className, children }: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <div
        className={cn(
          // flex-col + justify-center: canh nhóm label+input giữa khung theo chiều dọc.
          // py-4 vẫn là padding tối thiểu khi nội dung cao hơn min-h.
          'flex min-h-[92px] flex-col justify-center bg-blush px-4 py-4 sm:px-5',
          className,
        )}
      >
        <label htmlFor={id} className="block text-[16px] font-bold leading-6 text-primary sm:text-[18px]">
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
        {children}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 px-1 text-xs font-semibold text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
