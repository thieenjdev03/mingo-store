import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getProducts } from '@/features/product/api';
import { toProductCardView } from '@/features/product/types';
import { MOCKUP_CATEGORIES, getMockupCards } from '@/features/product/mockup-catalog';
import { resolveLocalized } from '@/types/localized';
import { routing } from '@/i18n/routing';
import { ProductShowcaseGrid, type ProductListCard } from '@/sections/products/product-showcase-grid';

interface CategorySection {
  slug: string;
  name: string;
  products: ProductListCard[];
}

/**
 * Danh sách sản phẩm nhóm THEO DANH MỤC: mỗi danh mục là một section (tiêu đề + link "Xem tất cả"
 * sang /categories/[slug]) với lưới sản phẩm dùng chung style. Trong mỗi nhóm, sản phẩm THẬT từ API
 * hiển thị trước, mockup nối sau (backend chưa seed). TODO: bộ lọc thương hiệu/vị/giá (plan §6.2).
 */
export default async function ProductListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations('products');

  // Gom sản phẩm thật từ API theo category.slug (null -> 'other').
  const apiByCategory = new Map<string, ProductListCard[]>();
  try {
    const res = await getProducts({ locale: safeLocale, status: 'active', limit: 100 });
    for (const product of res.data) {
      const card: ProductListCard = {
        ...toProductCardView(product, safeLocale),
        categoryName: product.category?.name ?? null,
        isMockup: false,
      };
      const slug = product.category?.slug ?? 'other';
      const bucket = apiByCategory.get(slug) ?? [];
      bucket.push(card);
      apiByCategory.set(slug, bucket);
    }
  } catch {
    // Trang listing marketing không nên vỡ vì API lỗi — vẫn còn mockup theo danh mục phía dưới.
  }

  // Dựng section theo thứ tự danh mục local; mỗi section = API cùng nhóm + mockup cùng nhóm.
  const usedSlugs = new Set<string>();
  const sections: CategorySection[] = [];
  for (const category of MOCKUP_CATEGORIES) {
    usedSlugs.add(category.slug);
    const products = [...(apiByCategory.get(category.slug) ?? []), ...getMockupCards(safeLocale, category.slug)];
    if (products.length > 0) {
      sections.push({ slug: category.slug, name: resolveLocalized(category.name, safeLocale), products });
    }
  }
  // Danh mục thật từ API không có trong danh sách local -> nối cuối.
  for (const [slug, cards] of apiByCategory) {
    if (usedSlugs.has(slug)) continue;
    sections.push({ slug, name: cards[0]?.categoryName ?? slug, products: cards });
  }

  const totalCount = sections.reduce((sum, section) => sum + section.products.length, 0);

  return (
    <div className="bg-background">
      <section className="flex flex-col items-center justify-center bg-sand px-5 py-16 text-center sm:py-20 lg:py-24">
        <h1 className="font-display text-[34px] font-bold leading-none text-foreground sm:text-[40px] lg:text-[48px]">
          {t('collectionTitle')}
        </h1>
        <p className="mt-4 max-w-xl text-base text-foreground/70">{t('subtitle')}</p>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-primary">
          {t('countLabel', { count: totalCount })}
        </p>
      </section>

      <div className="min-h-[600px] space-y-14 bg-background py-[56px] sm:space-y-16 sm:py-[72px] lg:py-[88px]">
        {sections.map((section) => (
          <section key={section.slug}>
            <div className="mx-auto mb-6 flex max-w-[1200px] items-baseline justify-between gap-4 px-5 sm:mb-8 sm:px-8 min-[1264px]:px-0">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{section.name}</h2>
              {section.slug !== 'other' && (
                <Link
                  href={`/categories/${section.slug}`}
                  className="shrink-0 text-sm font-bold uppercase tracking-[0.12em] text-primary transition-colors hover:text-primary/70"
                >
                  {t('viewAll')}
                </Link>
              )}
            </div>
            <ProductShowcaseGrid products={section.products} />
          </section>
        ))}
      </div>
    </div>
  );
}
