import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MUST_TRY_PRODUCTS } from '@/config/mingo-home-content';
import { ProductShowcaseGrid } from '@/sections/products/product-showcase-grid';

/** LISTING (stub) — filter category/brand/flavor/price. TODO: build theo storefront plan mục 6.2 */
export default async function ProductListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('products');
  return (
    <div className="bg-background">
      <section className="flex h-[280px] items-center justify-center bg-sand px-5 sm:h-[340px] lg:h-[400px]">
        <h1 className="text-center font-display text-[34px] font-bold leading-9 text-foreground sm:text-[40px] lg:text-[42px]">
          {t('collectionTitle')}
        </h1>
      </section>

      <section className="min-h-[674px] bg-background py-[72px] sm:py-[84px] lg:py-[89px]">
        <ProductShowcaseGrid products={MUST_TRY_PRODUCTS} />
      </section>
    </div>
  );
}
