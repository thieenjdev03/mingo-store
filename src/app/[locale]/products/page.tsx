import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { getProducts } from '@/features/product/api';
import { isPublicCatalogProduct, toProductCardView, type ProductCardView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { MustTrySection } from '@/sections/mingo-home/must-try/must-try-section';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl, localizedPath, pageMetadata, SEO_COPY, toSeoLocale } from '@/lib/seo';

interface CategorySection {
  slug: string;
  name: string;
  products: ProductCardView[];
}

// TODO(cache): bật lại sau khi test xong
// export const revalidate = 300;
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = toSeoLocale(locale);
  return pageMetadata({ locale: seoLocale, pathname: '/products', ...SEO_COPY[seoLocale].products });
}

export default async function ProductListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations('products');

  let loadFailed = false;
  const apiByCategory = new Map<string, CategorySection>();
  try {
    const response = await getProducts({ locale: safeLocale, status: 'active', limit: 100 });
    for (const product of response.data) {
      if (!isPublicCatalogProduct(product)) continue;
      const view = toProductCardView(product, safeLocale);
      const slug = product.category?.slug ?? 'other';
      const section = apiByCategory.get(slug) ?? {
        slug,
        name: product.category?.name ?? t('otherCategory'),
        products: [],
      };
      section.products.push({
        ...view,
      });
      apiByCategory.set(slug, section);
    }
  } catch {
    loadFailed = true;
  }

  const sections = Array.from(apiByCategory.values());
  const totalCount = sections.reduce((sum, section) => sum + section.products.length, 0);
  const itemList = sections.flatMap((section) => section.products);

  return (
    <div className="bg-background">
      {itemList.length > 0 ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: SEO_COPY[toSeoLocale(locale)].products.title,
            numberOfItems: itemList.length,
            itemListElement: itemList.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: product.name,
              url: absoluteUrl(localizedPath(locale, `/products/${product.slug}`)),
            })),
          }}
        />
      ) : null}
      <section className="flex flex-col items-center justify-center bg-sand px-5 py-16 text-center sm:py-20 lg:py-24">
        <h1 className="font-display text-[34px] font-bold leading-none text-foreground sm:text-[40px] lg:text-[48px]">{t('collectionTitle')}</h1>
        <p className="mt-4 max-w-xl text-base text-foreground/70">{t('subtitle')}</p>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-primary">{t('countLabel', { count: totalCount })}</p>
      </section>

      <div className="min-h-[600px] space-y-14 bg-background py-[56px] sm:space-y-16 sm:py-[72px] lg:py-[88px]">
        {loadFailed || sections.length === 0 ? (
          <p className="mx-auto max-w-xl px-5 text-center text-muted-foreground">{loadFailed ? t('loadError') : t('empty')}</p>
        ) : null}
        {sections.map((section) => (
          <MustTrySection
            key={section.slug}
            title={section.name}
            products={section.products}
            href={section.slug !== 'other' ? `/categories/${section.slug}` : undefined}
            viewAllLabel={t('viewAll')}
          />
        ))}
      </div>
    </div>
  );
}
