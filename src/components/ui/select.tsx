'use client';

import * as React from 'react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

/**
 * Re-brand của shadcn Select (xem CLAUDE.md "Add new primitives") — dùng token Mingo
 * thay vì shadcn mặc định (không có --popover/--input trong globals.css), khớp chiều cao/
 * bo góc với input thường (CheckoutInput, h-12 rounded-lg) để 2 loại field trông đồng bộ.
 */
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: 'sm' | 'default' }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        'group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 text-left text-base font-medium text-foreground shadow-[0_1px_2px_rgba(51,65,85,0.04)] outline-none transition-[border-color,box-shadow,background-color] data-[placeholder]:font-normal data-[placeholder]:text-muted-foreground/70 hover:border-primary/55 focus:border-primary focus:ring-4 focus:ring-primary/10 aria-invalid:border-destructive aria-invalid:ring-destructive/10 disabled:cursor-not-allowed disabled:bg-muted/45 disabled:opacity-60 data-[size=default]:h-12 data-[size=sm]:h-10 data-[state=open]:border-primary data-[state=open]:ring-4 data-[state=open]:ring-primary/10 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4 [&_svg:not([class*=text-])]:text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  align = 'start',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        align={align}
        sideOffset={4}
        className={cn(
          'relative z-50 max-h-(--radix-select-content-available-height) min-w-[var(--radix-select-trigger-width)] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-border/80 bg-card p-1 text-card-foreground shadow-[0_18px_45px_rgba(51,65,85,0.16)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground', className)}
      {...props}
    />
  );
}

export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex min-h-10 w-full cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-9 pr-3 text-sm font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary data-[state=checked]:bg-accent/70 data-[state=checked]:font-bold data-[state=checked]:text-primary',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

const EMPTY_VALUE = '__mingo_select_empty__';

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SelectFieldProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'default';
  /**
   * Co bề rộng vừa khít chữ thay vì `w-full`. Dùng cho thanh filter (nhiều select
   * đứng cạnh nhau), KHÔNG dùng trong form — field trong form phải full width.
   */
  fitContent?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/** Select cấp cao dùng chung cho storefront và admin. */
export function SelectField({
  id,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder,
  disabled,
  size,
  fitContent,
  className,
  ...ariaProps
}: SelectFieldProps) {
  const hasEmptyOption = options.some((option) => option.value === '');
  const toInternalValue = (nextValue: string | undefined) =>
    nextValue === '' && hasEmptyOption ? EMPTY_VALUE : nextValue;

  const trigger = (
    <SelectTrigger
      id={id}
      size={size}
      className={cn(fitContent && 'col-start-1 row-start-1', className)}
      {...ariaProps}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
  );

  return (
    <Select
      value={toInternalValue(value)}
      defaultValue={toInternalValue(defaultValue)}
      onValueChange={(nextValue) => onValueChange?.(nextValue === EMPTY_VALUE ? '' : nextValue)}
      disabled={disabled}
    >
      {fitContent ? (
        <span className="inline-grid">
          {/* Sizer vô hình: mọi nhãn xếp chồng cùng một ô grid, nên track rộng bằng
              nhãn DÀI NHẤT. Trigger (w-full) ăn theo track đó -> vừa khít chữ mà đổi
              lựa chọn không làm select co giãn. pr-11 chừa chỗ cho gap-3 + chevron. */}
          {options.map((option, index) => (
            <span
              key={option.value || `sizer-${index}`}
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 h-0 overflow-hidden whitespace-nowrap pl-4 pr-11 text-base font-medium"
            >
              {option.label}
            </span>
          ))}
          {trigger}
        </span>
      ) : (
        trigger
      )}
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value || EMPTY_VALUE}
            value={option.value || EMPTY_VALUE}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-default items-center justify-center py-1 text-muted-foreground', className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-default items-center justify-center py-1 text-muted-foreground', className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}
