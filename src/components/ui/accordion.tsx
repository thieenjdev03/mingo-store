'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Accordion theo mockup PDP: label uppercase đậm, divider mảnh, icon "+" xoay 45° khi mở.
 * (uppercase bằng CSS — KHÔNG viết hoa trong chuỗi i18n)
 */
export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn('border-b-2 border-foreground/80', className)} {...props} />;
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'flex flex-1 items-center justify-between py-4 text-left text-base font-bold uppercase tracking-wide transition-all [&[data-state=open]>svg]:rotate-45',
          className,
        )}
        {...props}
      >
        {children}
        <Plus className="size-5 shrink-0 transition-transform duration-200" aria-hidden />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-none data-[state=open]:animate-none"
      {...props}
    >
      <div className={cn('pb-4 text-sm leading-relaxed', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
