'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  emptyMessage?: string;
  className?: string;
}

/** Danh sách checkbox chọn nhiều (category_ids, collection_ids…). */
export function MultiSelect({ options, value, onChange, emptyMessage = 'Không có lựa chọn.', className }: MultiSelectProps) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  if (options.length === 0) {
    return <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className={cn('flex max-h-44 flex-col gap-1 overflow-y-auto rounded-md border border-border bg-white p-2', className)}>
      {options.map((opt) => {
        const checked = value.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
          >
            <span
              className={cn(
                'flex size-4 items-center justify-center rounded border',
                checked ? 'border-primary bg-primary text-white' : 'border-border bg-white',
              )}
            >
              {checked ? <Check className="size-3" /> : null}
            </span>
            {opt.name}
          </button>
        );
      })}
    </div>
  );
}
