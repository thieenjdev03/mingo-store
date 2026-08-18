import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { getBrandBySlug } from '@/features/brand/api';
import { getAllProducts } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { routing } from '@/i18n/routing';
import { BRANDS } from '@/config/brands';
import { ProductShowcaseGrid, type ProductListCard } from '@/sections/products/product-showcase-grid';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl, localizedPath, pageMetadata, toSeoLocale } from '@/lib/seo';
import { fetchNavBrands, localNavBrands } from '@/features/catalog/nav-data';

function titleFromSlug(slug: string) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

const BRAND_BANNER_COLORS = [
  '#F7D86A',
  '#F3A38B',
  '#A9D9D0',
  '#B9C9F4',
  '#D7B8E8',
  '#F1BC72',
] as const;

// TODO(cache): bật lại sau khi test xong
// export const revalidate = 300;
export const revalidate = 0;
// TODO(cache): bật lại sau khi test xong
// export const dynamic = 'force-static';

export async function generateStaticParams() {
  const apiBrands = await fetchNavBrands().catch(() => []);
  const brands = apiBrands.length > 0 ? apiBrands : localNavBrands();
  return brands.map((brand) => ({ slug: brand.slug }));
}

/** Chọn màu ổn định theo slug để banner không đổi màu giữa server và client. */
function bannerColorFromSlug(slug: string) {
  const hash = Array.from(slug).reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 0);
  return BRAND_BANNER_COLORS[hash % BRAND_BANNER_COLORS.length];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const seoLocale = toSeoLocale(locale);
  const brand = await getBrandBySlug(slug).catch(() => null);
  const name = brand?.name ?? BRANDS.find((item) => item.slug === slug)?.name ?? titleFromSlug(slug);
  const description = seoLocale === 'vi'
    ? `Khám phá thương hiệu kem ${name}, các sản phẩm và hương vị nổi bật thuộc Mingo Ice Cream.`
    : `Explore ${name} ice cream products and signature flavours from Mingo Ice Cream.`;
  return pageMetadata({
    locale: seoLocale,
    pathname: `/brands/${slug}`,
    title: seoLocale === 'vi' ? `Kem ${name} — Sản phẩm và hương vị | Mingo` : `${name} ice cream products and flavours | Mingo`,
    description,
    image: brand?.logo_url,
  });
}

export default async function BrandPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations('products');

  // Tên hiển thị: ưu tiên brand thật từ API, rồi sản phẩm/config, cuối cùng suy từ slug.
  let title = BRANDS.find((b) => b.slug === slug)?.name ?? titleFromSlug(slug);
  let bannerUrl: string | null = null;
  let products: ProductListCard[] = [];
  let loadFailed = false;

  const brand = await getBrandBySlug(slug).catch(() => null);
  title = brand?.name ?? title;
  bannerUrl = brand?.logo_url?.trim() || null;

  try {
    const allProducts = await getAllProducts({ locale: safeLocale, status: 'active' });
    const matching = allProducts.filter((product) => product.brand?.slug === slug);
    title = brand?.name ?? matching[0]?.brand?.name ?? title;
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
      <section
        className="relative flex h-[280px] items-center justify-center overflow-hidden px-5 text-center sm:h-[360px]"
        style={bannerUrl ? undefined : { backgroundColor: bannerColorFromSlug(slug) }}
      >
        {bannerUrl ? (
          <>
            <Image
              src={bannerUrl}
              alt={`Banner thương hiệu ${title}`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
          </>
        ) : null}
        <h1 className={`relative z-10 font-display text-[40px] font-bold leading-none sm:text-[48px] lg:text-[56px] ${bannerUrl ? 'text-white drop-shadow-md' : 'text-foreground'}`}>
          {title}
        </h1>
      </section>
      <section className="min-h-[560px] bg-fog py-8 sm:py-14 lg:py-18">
        {loadFailed || products.length === 0 ? (
          <p className="mx-auto max-w-xl px-5 text-center text-muted-foreground">{loadFailed ? t('loadError') : t('empty')}</p>
        ) : (
          <ProductShowcaseGrid products={products} outOfStockLabel={t('outOfStock')} contactLabel={t('priceOnRequest')} unavailableContactLabel={t('contactForInfo')} />
        )}
      </section>
    </div>
  );
}
