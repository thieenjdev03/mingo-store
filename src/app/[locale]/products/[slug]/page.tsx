import Image from 'next/image';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { Chip } from '@/components/ui/chip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PurchasePanel } from '@/features/product/purchase-panel';
import { toProductDetailView } from '@/features/product/types';
import type { ProductResponseDto } from '@/lib/api/generated/ecomAPI.schemas';
import { routing } from '@/i18n/routing';

/**
 * PDP (stub) — layout 2 cột theo mockup. Mock data chạy qua ĐÚNG pipeline thật:
 * ProductResponseDto -> toProductDetailView(locale) -> component chỉ thấy view model.
 * The real backend resolves name/slug/description per the requested `locale` query param
 * server-side (see ProductsService.transformProductForLocale), so a single mock object
 * (fixed text) stands in fine here — no vi/en variants needed at this layer.
 * TODO(data): thay MOCK bằng fetch API theo slug (GET /products/slug/:slug?locale=).
 */
const MOCK: ProductResponseDto = {
  id: 'demo-1',
  name: 'Creme Caramel',
  slug: 'creme-caramel',
  description: 'Kem que vị caramel custard, topping trân châu đường đen.',
  short_description: null,
  price: 100000,
  sale_price: null,
  cost_price: null,
  images: [],
  stock_quantity: 0,
  sku: null,
  barcode: null,
  tags: [],
  status: 'active',
  is_featured: true,
  enable_sale_tag: false,
  meta_title: null,
  meta_description: null,
  weight: null,
  dimensions: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
  category: { id: 'c1', name: 'Kem que', slug: 'kem-que' },
  variants: [
    {
      sku: 'CC-24',
      name: '24 Cây/Thùng',
      price: 100000,
      stock: 12,
      color_id: '00000000-0000-0000-0000-000000000000',
      size_id: '00000000-0000-0000-0000-000000000001',
    },
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
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      {/* minmax(0,…): plain 1fr floors at min-content, which the nowrap CTA blew past on tablet */}
      <div className="grid gap-8 md:grid-cols-[45%_minmax(0,1fr)] md:gap-10 lg:gap-12">
        {/* Gallery */}
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] md:max-w-none">
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
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">{product.name}</h1>
          <div className="flex flex-wrap gap-2">
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
