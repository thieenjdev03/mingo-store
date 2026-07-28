import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { Chip } from '@/components/ui/chip';
import { fWeight } from '@/lib/format';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PurchasePanel } from '@/features/product/purchase-panel';
import { getProductBySlug } from '@/features/product/api';
import { toProductDetailView } from '@/features/product/types';
import { routing } from '@/i18n/routing';

/**
 * PDP lấy dữ liệu trực tiếp từ GET /products/slug/:slug?locale=.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations('product');

  const apiProduct = await getProductBySlug(slug, safeLocale).catch(() => null);
  if (!apiProduct) notFound();
  const product = toProductDetailView(apiProduct, safeLocale);
  const nutritionEntries = Object.entries(product.nutrition ?? {});

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
            {product.categoryName && <Chip>{product.categoryName}</Chip>}
            {product.weightGrams != null ? <Chip>{product.weightGrams} g</Chip> : null}
            {product.weightGrams == null && product.weightKg != null ? <Chip>{fWeight(product.weightKg)}</Chip> : null}
            {product.collectionName && <Chip>{product.collectionName}</Chip>}
          </div>

          <PurchasePanel product={product} />

          {/* 4 accordion — nội dung parse từ description markdown (convention 4 heading, xem plan §0.2) */}
          <Accordion type="single" collapsible defaultValue="description">
            <AccordionItem value="description">
              <AccordionTrigger>{t('description')}</AccordionTrigger>
              <AccordionContent>{product.descriptionMarkdown}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="ingredients">
              <AccordionTrigger>{t('allergens')}</AccordionTrigger>
              <AccordionContent>
                {product.allergens.length > 0 ? product.allergens.join(', ') : t('notProvided')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="usage">
              <AccordionTrigger>{t('nutrition')}</AccordionTrigger>
              <AccordionContent>
                {nutritionEntries.length > 0 ? (
                  <dl className="grid gap-2 sm:grid-cols-2">
                    {nutritionEntries.map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4">
                        <dt className="font-semibold">{key}</dt>
                        <dd>{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : t('notProvided')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="notes">
              <AccordionTrigger>{t('barcode')}</AccordionTrigger>
              <AccordionContent>{product.barcode ?? t('notProvided')}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
