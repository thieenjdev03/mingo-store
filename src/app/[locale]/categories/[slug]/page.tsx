import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { getProducts } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { CategoryProductGrid, type CategoryProductCard } from '@/sections/products/category-product-grid';

function titleFromSlug(slug: string) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations('products');
  let title = titleFromSlug(slug);
  let products: CategoryProductCard[] = [];
  let loadFailed = false;

  try {
    const response = await getProducts({ locale: safeLocale, status: 'active', limit: 100 });
    const matching = response.data.filter((product) => product.category?.slug === slug);
    title = matching[0]?.category?.name ?? title;
    products = matching.map((product) => {
      const view = toProductCardView(product, safeLocale);
      return {
        ...view,
        spec: product.weight_grams ? `${product.weight_grams} g` : null,
      };
    });
  } catch {
    loadFailed = true;
  }

  return (
    <div className="bg-fog">
      <section className="flex h-[360px] items-center justify-center bg-butter px-5 text-center sm:h-[420px]">
        <h1 className="font-display text-[40px] font-bold leading-none text-foreground sm:text-[48px] lg:text-[56px]">{title}</h1>
      </section>
      <section className="min-h-[560px] bg-fog py-16 sm:py-20 lg:py-24">
        {loadFailed || products.length === 0 ? <p className="mx-auto max-w-xl px-5 text-center text-muted-foreground">{loadFailed ? t('loadError') : t('empty')}</p> : <CategoryProductGrid products={products} />}
      </section>
    </div>
  );
}
