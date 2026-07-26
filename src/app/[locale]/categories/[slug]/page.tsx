import { setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { getProducts } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { getMockupCards, getMockupCategory } from '@/features/product/mockup-catalog';
import { resolveLocalized } from '@/types/localized';
import { routing } from '@/i18n/routing';
import { CategoryProductGrid, type CategoryProductCard } from '@/sections/products/category-product-grid';

function titleFromSlug(slug: string) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

/**
 * Trang danh mục — fetch sản phẩm THẬT theo category qua API và hiển thị. Nếu backend chưa có
 * sản phẩm nào thuộc nhóm (chưa seed), fallback sang catalog mockup cùng nhóm để trang không trống.
 */
export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  const category = getMockupCategory(slug);

  let apiCards: CategoryProductCard[] = [];
  try {
    const res = await getProducts({ locale: safeLocale, status: 'active', limit: 100 });
    apiCards = res.data
      .filter((product) => product.category?.slug === slug)
      .map((product) => {
        const view = toProductCardView(product, safeLocale);
        return {
          id: view.id,
          slug: view.slug,
          name: view.name,
          image: view.image,
          price: view.price,
          spec: product.variants?.[0]?.name ?? null,
        };
      });
  } catch {
    apiCards = [];
  }

  // Ưu tiên dữ liệu thật; chưa có -> mockup cùng nhóm.
  const mockupCards: CategoryProductCard[] = getMockupCards(safeLocale, slug).map((card) => ({
    id: card.id,
    slug: card.slug,
    name: card.name,
    image: card.image,
    price: card.price,
    spec: card.spec,
  }));
  const products = apiCards.length > 0 ? apiCards : mockupCards;

  // Slug không khớp danh mục nào và cũng không có sản phẩm -> 404.
  if (!category && products.length === 0) notFound();

  const title = category ? resolveLocalized(category.name, safeLocale) : titleFromSlug(slug);

  return (
    <div className="bg-fog">
      <section className="flex h-[360px] items-center justify-center bg-butter px-5 text-center sm:h-[420px]">
        <h1 className="font-display text-[40px] font-bold leading-none text-foreground sm:text-[48px] lg:text-[56px]">
          {title}
        </h1>
      </section>

      <section className="min-h-[560px] bg-fog py-16 sm:py-20 lg:py-24">
        <CategoryProductGrid products={products} />
      </section>
    </div>
  );
}
