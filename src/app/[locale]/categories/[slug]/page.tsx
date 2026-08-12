import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { getCategoryBySlug } from '@/features/category/api';
import { getAllProducts } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { ProductShowcaseGrid, type ProductListCard } from '@/sections/products/product-showcase-grid';

function titleFromSlug(slug: string) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations('products');
  let title = titleFromSlug(slug);
  let description: string | null = null;
  let products: ProductListCard[] = [];
  let loadFailed = false;

  // Chi tiết category (tên + mô tả) độc lập với danh sách sản phẩm — lỗi một bên không hỏng bên kia.
  const category = await getCategoryBySlug(slug).catch(() => null);
  title = category?.name ?? title;
  description = category?.description ?? null;

  try {
    const allProducts = await getAllProducts({ locale: safeLocale, status: 'active' });
    const matching = allProducts.filter((product) => product.category?.slug === slug);
    title = category?.name ?? matching[0]?.category?.name ?? title;
    products = matching.map((product) => {
      const view = toProductCardView(product, safeLocale);
      return {
        ...view,
        categoryName: product.category?.name ?? null,
      };
    });
  } catch {
    loadFailed = true;
  }

  return (
    <div className="bg-fog">
      <section className="flex h-[360px] flex-col items-center justify-center gap-4 bg-butter px-5 text-center sm:h-[420px]">
        <h1 className="font-display text-[40px] font-bold leading-none text-foreground sm:text-[48px] lg:text-[56px]">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">{description}</p>
        ) : null}
      </section>
      <section className="min-h-[560px] bg-fog py-16 sm:py-20 lg:py-24">
        {loadFailed || products.length === 0 ? <p className="mx-auto max-w-xl px-5 text-center text-muted-foreground">{loadFailed ? t('loadError') : t('empty')}</p> : <ProductShowcaseGrid products={products} outOfStockLabel={t('outOfStock')} contactLabel={t('priceOnRequest')} unavailableContactLabel={t('contactForInfo')} />}
      </section>
    </div>
  );
}
