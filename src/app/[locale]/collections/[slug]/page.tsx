import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCollectionCatalog } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { ProductShowcaseGrid, type ProductListCard } from '@/sections/products/product-showcase-grid';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl, localizedPath, pageMetadata, seoDescription, toSeoLocale } from '@/lib/seo';
import { getStorefrontHome } from '@/features/home/api';

// TODO(cache): bật lại sau khi test xong
// export const revalidate = 300;
export const revalidate = 0;
// TODO(cache): bật lại sau khi test xong
// export const dynamic = 'force-static';

export async function generateStaticParams() {
  const home = await getStorefrontHome('vi').catch(() => ({ heroes: [], sections: [] }));
  return home.sections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const seoLocale = toSeoLocale(locale);
  const collection = await getCollectionCatalog(slug, seoLocale).catch(() => null);
  const name = collection?.name ?? slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  const fallback = seoLocale === 'vi'
    ? `Khám phá bộ sưu tập ${name} và các sản phẩm kem nổi bật từ Mingo Ice Cream.`
    : `Explore the ${name} collection and featured ice cream products from Mingo.`;
  return pageMetadata({
    locale: seoLocale,
    pathname: `/collections/${slug}`,
    title: seoLocale === 'vi' ? `${name} — Bộ sưu tập kem Mingo` : `${name} ice cream collection | Mingo`,
    description: seoDescription(collection?.description, fallback),
  });
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const collection = await getCollectionCatalog(slug, safeLocale).catch(() => null);
  if (!collection) notFound();
  const t = await getTranslations('products');

  const products: ProductListCard[] = collection.products.map((product) => {
    const view = toProductCardView(product, safeLocale);
    return { ...view, categoryName: product.category?.name ?? null };
  });

  return (
    <div className="bg-fog">
      {products.length > 0 ? (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: collection.name,
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: product.name,
            url: absoluteUrl(localizedPath(safeLocale, `/products/${product.slug}`)),
          })),
        }} />
      ) : null}
      <section className="flex h-[240px] flex-col items-center justify-center gap-4 bg-butter px-5 text-center sm:h-[320px]">
        <h1 className="font-display text-[40px] font-bold leading-none text-foreground sm:text-[48px] lg:text-[56px]">{collection.name}</h1>
        {collection.description ? (
          <p className="max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">{collection.description}</p>
        ) : null}
      </section>
      <section className="min-h-[560px] bg-fog py-16 sm:py-20 lg:py-24">
        {products.length === 0 ? (
          <p className="mx-auto max-w-xl px-5 text-center text-muted-foreground">{t('empty')}</p>
        ) : (
          <ProductShowcaseGrid products={products} outOfStockLabel={t('outOfStock')} contactLabel={t('priceOnRequest')} unavailableContactLabel={t('contactForInfo')} />
        )}
      </section>
    </div>
  );
}
