import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { Chip } from '@/components/ui/chip';
import { fWeight } from '@/lib/format';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PurchasePanel } from '@/features/product/purchase-panel';
import { ProductGallery } from '@/features/product/product-gallery';
import { ProductVariantSelectionProvider } from '@/features/product/product-variant-selection';
import { MustTrySection } from '@/sections/mingo-home/must-try/must-try-section';
import { getProductBySlug, getProductsByCategory, getSizeMetaById } from '@/features/product/api';
import { isPublicCatalogProduct, toProductCardView, toProductDetailView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl, localizedPath, pageMetadata, seoDescription, toSeoLocale } from '@/lib/seo';

const richHtmlClass =
  'space-y-2 [&_a]:text-primary [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_table]:w-full [&_table]:border-collapse [&_table]:border-0 [&_table_*]:border-0 [&_td]:p-2 [&_th]:p-2 [&_ul]:list-disc';

export const dynamic = 'force-dynamic';

async function resolveProduct(slug: string, locale: 'vi' | 'en') {
  return getProductBySlug(slug, locale).catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const seoLocale = toSeoLocale(locale);
  const apiProduct = await resolveProduct(slug, seoLocale);
  if (!apiProduct || !isPublicCatalogProduct(apiProduct)) {
    return pageMetadata({
      locale: seoLocale,
      pathname: `/products/${slug}`,
      title: seoLocale === 'vi' ? 'Sản phẩm kem | Mingo Ice Cream' : 'Ice cream product | Mingo Ice Cream',
      description: seoLocale === 'vi' ? 'Khám phá sản phẩm kem Mingo Ice Cream.' : 'Discover this Mingo Ice Cream product.',
    });
  }

  const product = toProductDetailView(apiProduct, seoLocale);
  const fallbackDescription = seoLocale === 'vi'
    ? `Khám phá ${product.name} của Mingo Ice Cream, thông tin sản phẩm, quy cách và tình trạng hàng.`
    : `Discover ${product.name} from Mingo Ice Cream, including product details, pack size and availability.`;
  return pageMetadata({
    locale: seoLocale,
    pathname: `/products/${product.slug}`,
    title: seoLocale === 'vi' ? `${product.name} — Kem Mingo Ice Cream` : `${product.name} — Mingo Ice Cream`,
    description: seoDescription(product.descriptionHtml, fallbackDescription),
    image: product.image,
  });
}

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

  const apiProduct = await resolveProduct(slug, safeLocale);
  if (!apiProduct || !isPublicCatalogProduct(apiProduct)) notFound();
  // Thuộc tính quy cách đầy đủ để dựng nhãn "24 cây / thùng, cây 60 gr" — API sản phẩm chỉ nhúng {id, name}.
  const sizeMetaById = apiProduct.variants?.length ? await getSizeMetaById() : undefined;
  const product = toProductDetailView(apiProduct, safeLocale, sizeMetaById);

  // "Gợi ý cho bạn": sản phẩm cùng category với sản phẩm đang xem (loại chính nó), tối đa 8.
  const suggestions = product.categoryId
    ? (await getProductsByCategory(product.categoryId, safeLocale).catch(() => []))
        .filter((item) => item.id !== product.id && item.status === 'active')
        .slice(0, 8)
        .map((item) => toProductCardView(item, safeLocale))
    : [];

  const breadcrumbCollection = product.collectionName ?? product.categoryName;
  const productUrl = absoluteUrl(localizedPath(safeLocale, `/products/${product.slug}`));
  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    url: productUrl,
    image: product.images.length > 0 ? product.images.map((image) => absoluteUrl(image)) : undefined,
    description: seoDescription(product.descriptionHtml, product.name),
    sku: product.variants[0]?.sku ?? undefined,
    gtin: product.barcode ?? undefined,
    brand: product.brandName ? { '@type': 'Brand', name: product.brandName } : { '@type': 'Brand', name: 'Mingo' },
    category: product.categoryName ?? undefined,
    offers: !product.isContactForPrice && product.price > 0 ? {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'VND',
      price: product.price,
      availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    } : undefined,
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: safeLocale === 'vi' ? 'Sản phẩm' : 'Products',
        item: absoluteUrl(localizedPath(safeLocale, '/products')),
      },
      ...(product.categoryName && product.categorySlug ? [{
        '@type': 'ListItem',
        position: 2,
        name: product.categoryName,
        item: absoluteUrl(localizedPath(safeLocale, `/categories/${product.categorySlug}`)),
      }] : []),
      {
        '@type': 'ListItem',
        position: product.categoryName ? 3 : 2,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <div className="bg-[#f5f5f5] text-[#563e2b]">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <nav className="bg-white no-scrollbar flex h-[36px] items-center gap-2 overflow-x-auto px-4 text-[12px] font-bold text-primary lg:h-[68px] lg:px-[max(2rem,calc((100vw-1200px)/2))] lg:text-[18px]">
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

      <ProductVariantSelectionProvider key={product.id} initialSku={product.defaultVariantSku}>
        <main className="mx-auto w-full max-w-[1200px] lg:grid lg:grid-cols-[588px_588px] lg:gap-6 lg:pt-[12px] lg:pb-[39px]">
          <ProductGallery images={product.images} productName={product.name} variants={product.variants} />

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

          {!product.descriptionHtml ? (
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
              {safeLocale === 'vi'
                ? `${product.name} là sản phẩm thuộc dòng ${product.categoryName ?? 'kem Mingo'}, với thông tin quy cách và tình trạng hàng được cập nhật trực tiếp tại Mingo Ice Cream.`
                : `${product.name} is part of the ${product.categoryName ?? 'Mingo ice cream'} range. Pack sizes and availability are updated directly by Mingo Ice Cream.`}
            </p>
          ) : null}

          <div className="mt-4 lg:mt-[34px]">
            <PurchasePanel product={product} />
          </div>

          <Accordion type="single" collapsible defaultValue="description" className="mt-4 lg:mt-[30px]">
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
      </ProductVariantSelectionProvider>

      <MustTrySection
        title={t('suggestions')}
        titleAlign="center"
        products={suggestions}
      />
    </div>
  );
}
