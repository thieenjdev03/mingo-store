import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCollectionCatalog } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { ProductShowcaseGrid } from '@/sections/products/product-showcase-grid';

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

  return (
    <div className="bg-fog">
      <section className="flex min-h-[360px] flex-col items-center justify-center bg-butter px-5 py-16 text-center sm:min-h-[420px]">
        <h1 className="font-display text-[40px] font-bold leading-none text-foreground sm:text-[48px] lg:text-[56px]">{collection.name}</h1>
        {collection.description ? <p className="mt-5 max-w-2xl text-foreground/70">{collection.description}</p> : null}
      </section>
      <section className="min-h-[560px] bg-fog py-16 sm:py-20 lg:py-24">
        <ProductShowcaseGrid products={collection.products.map((product) => toProductCardView(product, safeLocale))} outOfStockLabel={t('outOfStock')} />
      </section>
    </div>
  );
}
