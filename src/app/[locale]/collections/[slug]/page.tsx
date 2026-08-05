import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCollectionCatalog } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { MustTrySection } from '@/sections/mingo-home/must-try/must-try-section';

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
    <div className="bg-background">
      {collection.products.length > 0 ? (
        <MustTrySection
          title={collection.name}
          description={collection.description}
          products={collection.products.map((product) => toProductCardView(product, safeLocale))}
        />
      ) : (
        <p className="mx-auto max-w-xl px-5 py-24 text-center text-muted-foreground">{t('empty')}</p>
      )}
    </div>
  );
}
