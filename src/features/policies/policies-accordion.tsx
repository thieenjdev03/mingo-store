'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { PolicyDetailView } from './types';

interface PoliciesAccordionProps {
  items: PolicyDetailView[];
  /** Slug mở sẵn khi vào trang (vd từ ?policy=). Bỏ trống -> tất cả đóng. */
  defaultSlug?: string;
}

/**
 * Danh sách chính sách dạng accordion (theo design): tiêu đề + icon "+" xoay 45° khi mở,
 * nội dung HTML (đã sanitize server-side) render inline khi bung.
 */
export function PoliciesAccordion({ items, defaultSlug }: PoliciesAccordionProps) {
  if (items.length === 0) return null;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultSlug}
      className="mt-8 border-t border-foreground/15 sm:mt-10"
    >
      {items.map((item) => (
        <AccordionItem key={item.slug} value={item.slug} className="border-b border-foreground/15">
          <AccordionTrigger className="py-4 text-[15px] font-medium normal-case tracking-normal text-foreground/85 hover:text-primary data-[state=open]:text-primary sm:py-5 sm:text-base [&>svg]:size-6 [&>svg]:text-foreground/50">
            {item.title}
          </AccordionTrigger>
          <AccordionContent>
            <div
              className="max-w-none pb-2 text-[15px] leading-relaxed text-foreground/85 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-bold [&_table]:w-full [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
              // eslint-disable-next-line react/no-danger -- content đã được backend sanitize (xem policies module)
              dangerouslySetInnerHTML={{ __html: item.contentHtml }}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
