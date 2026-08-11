import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { Chip } from '@/components/ui/chip';
import { fWeight } from '@/lib/format';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PurchasePanel } from '@/features/product/purchase-panel';
import { MustTrySection } from '@/sections/mingo-home/must-try/must-try-section';
import { getProductBySlug, getProductsByCategory } from '@/features/product/api';
import { getMockupBySlug, toMockupProductDto } from '@/features/product/mockup-catalog';
import { toProductCardView, toProductDetailView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

const richHtmlClass =
  'space-y-2 [&_a]:text-primary [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:p-2 [&_ul]:list-disc';

/**
 * PDP responsive theo hai frame Figma:
 * desktop PRODUCT DETAILS (102:106), mobile Product Details (398:2688).
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

  // Backend chưa seed sản phẩm -> fallback sang mockup catalog để PDP (kèm mô tả HTML) vẫn hiển thị.
  const mockup = getMockupBySlug(slug);
  const apiProduct =
    (await getProductBySlug(slug, safeLocale).catch(() => null)) ??
    (mockup ? toMockupProductDto(mockup, safeLocale) : null);
  if (!apiProduct) notFound();
  const product = toProductDetailView(apiProduct, safeLocale);

  // "Gợi ý cho bạn": sản phẩm cùng category với sản phẩm đang xem (loại chính nó), tối đa 8.
  const suggestions = product.categoryId
    ? (await getProductsByCategory(product.categoryId, safeLocale).catch(() => []))
        .filter((item) => item.id !== product.id && item.status === 'active')
        .slice(0, 8)
        .map((item) => toProductCardView(item, safeLocale))
    : [];

  const breadcrumbCollection = product.collectionName ?? product.categoryName;

  return (
    <div className="bg-[#f5f5f5] text-[#563e2b]">
      <nav className="no-scrollbar flex h-[48px] items-center gap-2 overflow-x-auto px-4 text-[12px] font-bold text-primary lg:h-[100px] lg:px-[max(2rem,calc((100vw-1200px)/2))] lg:text-[18px]">
        <Link href="/products" className="shrink-0">Products</Link>
        <ChevronRight className="size-4 shrink-0" strokeWidth={1.5} />
        {breadcrumbCollection ? (
          <>
            <span className="shrink-0">{breadcrumbCollection}</span>
            <ChevronRight className="size-4 shrink-0" strokeWidth={1.5} />
          </>
        ) : null}
        <span className="shrink-0">{product.name}</span>
      </nav>

      <main className="mx-auto w-full max-w-[1200px] lg:grid lg:grid-cols-[588px_588px] lg:gap-6 lg:pt-[39px]">
        <div className="relative flex h-[450px] w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#fff1e8_0%,rgba(255,241,232,0)_70%)] lg:aspect-[3/4] lg:h-auto lg:bg-none">
          {product.image ? (
            <div className="relative h-[376px] w-[282px] lg:size-full">
              <Image src={product.image} alt={product.name} fill className="object-contain" priority />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-muted text-6xl">🍦</div>
          )}
        </div>

        <div className="px-4 pb-4 pt-8 lg:px-0 lg:pb-0 lg:pt-[102px]">
          {breadcrumbCollection ? (
            <p className="inline-block border-b-2 border-primary pb-0.5 text-[14px] font-bold leading-[17px] text-primary lg:border-b-[3px] lg:text-[28px] lg:leading-8">
              {breadcrumbCollection}
            </p>
          ) : null}
          <h1 className="mt-4 font-sans text-[28px] font-bold leading-[34px] text-[#653819] lg:mt-[30px] lg:text-[60px] lg:leading-[60px]">
            {product.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2 lg:mt-[30px] lg:gap-[25px]">
            {product.brandName && <Chip className="rounded-l-none text-primary">{product.brandName}</Chip>}
            {product.collectionName && <Chip className="rounded-l-none text-primary">{product.collectionName}</Chip>}
            {product.categoryName && <Chip className="rounded-l-none text-primary">{product.categoryName}</Chip>}
            {product.weightGrams != null ? <Chip className="rounded-l-none text-primary">{product.weightGrams} g</Chip> : null}
            {product.weightGrams == null && product.weightKg != null ? (
              <Chip className="rounded-l-none text-primary">{fWeight(product.weightKg)}</Chip>
            ) : null}
          </div>

          <div className="mt-4 lg:mt-[34px]">
            <PurchasePanel product={product} />
          </div>

          <Accordion type="single" collapsible className="mt-4 lg:mt-[30px]">
            <AccordionItem value="description" className="border-b border-[#563e2b]">
              <AccordionTrigger className="py-4 text-[16px] leading-6 lg:py-[15px] lg:text-[24px]">
                {t('description')}
              </AccordionTrigger>
              <AccordionContent>
                {product.descriptionHtml ? (
                  <div className={richHtmlClass} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                ) : (
                  t('notProvided')
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ingredients" className="border-b border-[#563e2b]">
              <AccordionTrigger className="py-4 text-[16px] leading-6 lg:py-[15px] lg:text-[24px]">
                {t('ingredients')}
              </AccordionTrigger>
              <AccordionContent>
                {product.allergensHtml ? (
                  <div className={richHtmlClass} dangerouslySetInnerHTML={{ __html: product.allergensHtml }} />
                ) : null}
                {!product.allergensHtml ? t('notProvided') : null}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="usage" className="border-b border-[#563e2b]">
              <AccordionTrigger className="py-4 text-[16px] leading-6 lg:py-[15px] lg:text-[24px]">
                {t('usage')}
              </AccordionTrigger>
              <AccordionContent>
                {product.usageHtml ? (
                  <div className={richHtmlClass} dangerouslySetInnerHTML={{ __html: product.usageHtml }} />
                ) : (
                  t('notProvided')
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="notes" className="border-b border-[#563e2b]">
              <AccordionTrigger className="py-4 text-[16px] leading-6 lg:py-[15px] lg:text-[24px]">
                {t('notes')}
              </AccordionTrigger>
              <AccordionContent>
                {product.notesHtml ? (
                  <div className={richHtmlClass} dangerouslySetInnerHTML={{ __html: product.notesHtml }} />
                ) : product.barcode ? (
                  product.barcode
                ) : (
                  t('notProvided')
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>

      <MustTrySection
        title={t('suggestions')}
        titleAlign="center"
        products={suggestions}
      />
    </div>
  );
}
