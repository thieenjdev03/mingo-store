import Image from 'next/image';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { Chip } from '@/components/ui/chip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PurchasePanel } from '@/features/product/purchase-panel';
import { toProductDetailView } from '@/features/product/types';
import type { ApiProduct } from '@/types/api-placeholder';
import { routing } from '@/i18n/routing';

/**
 * PDP (stub) — layout 2 cột theo mockup. Mock data chạy qua ĐÚNG pipeline thật:
 * ApiProduct -> toProductDetailView(locale) -> component chỉ thấy view model.
 * TODO(data): thay MOCK bằng fetch API theo slug sau khi api:gen (xem mingo-pdp-frontend-plan.md).
 */
const MOCK: ApiProduct = {
  id: 'demo-1',
  name: { vi: 'Creme Caramel', en: 'Creme Caramel' },
  slug: { vi: 'creme-caramel', en: 'creme-caramel' },
  description: { vi: 'Kem que vị caramel custard, topping trân châu đường đen.', en: 'Custard caramel ice cream bar with brown-sugar boba.' },
  price: 100000,
  sale_price: null,
  images: [],
  stock_quantity: 0,
  status: 'active',
  is_featured: true,
  tags: [],
  category: { id: 'c1', name: { vi: 'Kem que', en: 'Ice cream bars' }, slug: { vi: 'kem-que', en: 'bars' } },
  collections: [{ id: 'col1', name: { vi: 'Dessert Collection', en: 'Dessert Collection' }, slug: 'dessert-collection' }],
  variants: [
    { sku: 'CC-24', name: { vi: '24 Cây/Thùng', en: '24 Bars/Carton' }, price: 100000, stock: 12, size_id: 's1', color_id: null },
  ],
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations('product');

  const product = toProductDetailView(MOCK, safeLocale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="grid gap-12 md:grid-cols-[45%_1fr]">
        {/* Gallery */}
        <div className="relative aspect-[3/4]">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-contain" priority />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-muted text-6xl">🍦</div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-5">
          {product.collectionName && (
            <p className="font-display text-xl font-bold text-primary underline underline-offset-4">
              {product.collectionName}
            </p>
          )}
          <h1 className="font-display text-5xl">{product.name}</h1>
          <div className="flex gap-2">
            {product.collectionName && <Chip>{product.collectionName}</Chip>}
            {product.categoryName && <Chip>{product.categoryName}</Chip>}
          </div>

          <PurchasePanel product={product} />

          {/* 4 accordion — nội dung parse từ description markdown (convention 4 heading, xem plan §0.2) */}
          <Accordion type="single" collapsible defaultValue="description">
            <AccordionItem value="description">
              <AccordionTrigger>{t('description')}</AccordionTrigger>
              <AccordionContent>{product.descriptionMarkdown}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="ingredients">
              <AccordionTrigger>{t('ingredients')}</AccordionTrigger>
              <AccordionContent>TODO: parse từ section markdown.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="usage">
              <AccordionTrigger>{t('usage')}</AccordionTrigger>
              <AccordionContent>TODO: parse từ section markdown.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="notes">
              <AccordionTrigger>{t('notes')}</AccordionTrigger>
              <AccordionContent>TODO: parse từ section markdown.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
