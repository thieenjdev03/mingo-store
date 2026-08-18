import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { getCategoryBySlug } from '@/features/category/api';
import { getAllProducts } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { ProductShowcaseGrid, type ProductListCard } from '@/sections/products/product-showcase-grid';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl, localizedPath, pageMetadata, seoDescription, toSeoLocale } from '@/lib/seo';
import { fetchNavCategories, localNavCategories } from '@/features/catalog/nav-data';

// TODO(cache): bật lại sau khi test xong
// export const revalidate = 300;
export const revalidate = 0;
// TODO(cache): bật lại sau khi test xong
// export const dynamic = 'force-static';

export async function generateStaticParams() {
  const apiCategories = await fetchNavCategories().catch(() => []);
  const categories = apiCategories.length > 0 ? apiCategories : localNavCategories('vi');
  return categories.map((category) => ({ slug: category.slug }));
}

function titleFromSlug(slug: string) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const seoLocale = toSeoLocale(locale);
  const category = await getCategoryBySlug(slug).catch(() => null);
  const name = category?.name ?? titleFromSlug(slug);
  const fallback = seoLocale === 'vi'
    ? `Khám phá các sản phẩm ${name} của Mingo Ice Cream, hương vị và quy cách phù hợp cho mọi khoảnh khắc.`
    : `Explore Mingo ${name} products, flavours and pack sizes for every occasion.`;
  return pageMetadata({
    locale: seoLocale,
    pathname: `/categories/${slug}`,
    title: seoLocale === 'vi' ? `${name} — Sản phẩm kem Mingo Ice Cream` : `${name} ice cream products | Mingo`,
    description: seoDescription(category?.description, fallback),
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations('products');
  const tCategories = await getTranslations('categories');
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

  // API chưa có mô tả category -> dùng câu giới thiệu chuẩn từ i18n, không bịa nội dung marketing.
  const intro = description ?? tCategories('defaultIntro', { name: title });
  const categoryUrl = absoluteUrl(localizedPath(safeLocale, `/categories/${slug}`));

  return (
    <div className="bg-fog">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: safeLocale === 'vi' ? 'Trang chủ' : 'Home',
            item: absoluteUrl(localizedPath(safeLocale, '/')),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: safeLocale === 'vi' ? 'Sản phẩm' : 'Products',
            item: absoluteUrl(localizedPath(safeLocale, '/products')),
          },
          { '@type': 'ListItem', position: 3, name: title, item: categoryUrl },
        ],
      }} />
      {products.length > 0 ? (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: title,
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: product.name,
            url: absoluteUrl(localizedPath(safeLocale, `/products/${product.slug}`)),
          })),
        }} />
      ) : null}
      <section className="flex h-[360px] flex-col items-center justify-center gap-4 bg-butter px-5 text-center sm:h-[420px]">
        <h1 className="font-display text-[40px] font-bold leading-none text-foreground sm:text-[48px] lg:text-[56px]">{title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base">{intro}</p>
      </section>
      <section className="min-h-[560px] bg-fog py-16 sm:py-20 lg:py-24">
        {loadFailed || products.length === 0 ? <p className="mx-auto max-w-xl px-5 text-center text-muted-foreground">{loadFailed ? t('loadError') : t('empty')}</p> : <ProductShowcaseGrid products={products} outOfStockLabel={t('outOfStock')} contactLabel={t('priceOnRequest')} unavailableContactLabel={t('contactForInfo')} />}
      </section>
    </div>
  );
}
