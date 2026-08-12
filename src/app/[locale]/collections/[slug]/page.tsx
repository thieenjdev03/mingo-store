import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCollectionCatalog } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { ProductShowcaseGrid, type ProductListCard } from '@/sections/products/product-showcase-grid';

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
