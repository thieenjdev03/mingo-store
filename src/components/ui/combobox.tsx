'use client';

import * as React from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';
import { normalizeVietnamese } from '@/lib/vn-address';

export interface ComboboxOption {
  id: string;
  name: string;
}

interface ComboboxProps {
  id?: string;
  value: string;
  onChange: (id: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Merge vào (không thay thế) class mặc định của trigger — dùng để set border/bg/height... theo nơi gọi. */
  triggerClassName?: string;
  contentClassName?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * Select có ô tìm kiếm (combobox) — dùng cho các danh sách dài (tỉnh/thành, quận/huyện)
 * để gõ lọc nhanh thay vì cuộn tay. So khớp bỏ dấu qua normalizeVietnamese nên gõ không
 * dấu ("ha noi") vẫn ra "Hà Nội".
 */
export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder = '',
  searchPlaceholder = '',
  emptyText = '',
  disabled,
  triggerClassName,
  contentClassName,
  ...ariaProps
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.id === value) ?? null;

  const filtered = React.useMemo(() => {
    const q = normalizeVietnamese(query.trim());
    if (!q) return options;
    return options.filter((option) => normalizeVietnamese(option.name).includes(q));
  }, [options, query]);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [query, open]);

  function selectOption(option: ComboboxOption) {
    onChange(option.id);
    setOpen(false);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[highlightedIndex];
      if (option) selectOption(option);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
        if (next) {
          setQuery('');
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn('group flex w-full items-center justify-between gap-2 text-left outline-none disabled:cursor-not-allowed', triggerClassName)}
          {...ariaProps}
        >
          <span className={cn('min-w-0 flex-1 truncate', !selected && 'font-normal text-muted-foreground/70')}>
            {selected ? selected.name : placeholder}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          className={cn(
            'z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-[0_18px_45px_rgba(51,65,85,0.16)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            contentClassName,
          )}
        >
          <div className="border-b border-border/80 p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
            ) : (
              filtered.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(option)}
                  className={cn(
                    'flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground outline-none transition-colors',
                    index === highlightedIndex && 'bg-primary/10 text-primary',
                    option.id === value && 'font-bold text-primary',
                  )}
                >
                  <CheckIcon className={cn('size-4 shrink-0 text-primary', option.id !== value && 'invisible')} />
                  <span className="truncate">{option.name}</span>
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
