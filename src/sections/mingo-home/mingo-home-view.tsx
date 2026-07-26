import { getTranslations } from 'next-intl/server';
import { toProductCardView, type ProductCardView } from '@/features/product/types';
import { getMockupCards } from '@/features/product/mockup-catalog';
import type { Locale } from '@/types/localized';
import { getActiveHomepageBanners, getActiveCollections, getCollectionProducts } from '@/features/home/api';
import { toHeroBannerView, type HeroBannerView } from '@/features/home/types';
import { HeroCarousel } from './hero/hero-carousel';
import { MustTrySection } from './must-try/must-try-section';

const SECTION_PRODUCT_LIMIT = 8;
const MAX_HOMEPAGE_COLLECTIONS = 4;

interface CollectionSection {
  id: string;
  title: string;
  products: ProductCardView[];
}

async function getHeroBanners(): Promise<HeroBannerView[]> {
  try {
    const banners = await getActiveHomepageBanners();
    return [...banners].sort((a, b) => a.display_order - b.display_order).map(toHeroBannerView);
  } catch {
    // Landing page must never crash because homepage-content is unavailable.
    return [];
  }
}

/** Mỗi collection active do admin tạo (có sản phẩm) trở thành 1 section sản phẩm ở trang chủ. */
async function getCollectionSections(locale: Locale): Promise<CollectionSection[]> {
  try {
    const collections = await getActiveCollections();
    const sections = await Promise.all(
      collections.slice(0, MAX_HOMEPAGE_COLLECTIONS).map(async (collection) => {
        const products = await getCollectionProducts(collection.id, { limit: SECTION_PRODUCT_LIMIT, locale });
        return { id: collection.id, title: collection.name, products: products.map((p) => toProductCardView(p, locale)) };
      }),
    );
    return sections.filter((section) => section.products.length > 0);
  } catch {
    return [];
  }
}

export async function MingoHomeView({ locale }: { locale: Locale }) {
  const [banners, collectionSections, t, tProducts] = await Promise.all([
    getHeroBanners(),
    getCollectionSections(locale),
    getTranslations('home'),
    getTranslations('products'),
  ]);

  // Có collection thật (đã gán sản phẩm) -> hiển thị các section đó.
  // Chưa có -> fallback section "Phải thử" bằng sản phẩm mockup để trang chủ không trống.
  const sections: CollectionSection[] =
    collectionSections.length > 0
      ? collectionSections
      : [
          {
            id: 'mockup-must-try',
            title: t('mustTry'),
            products: getMockupCards(locale)
              .slice(0, SECTION_PRODUCT_LIMIT)
              .map((card) => ({ id: card.id, slug: card.slug, name: card.name, image: card.image, price: card.price })),
          },
        ];

  return (
    <>
      <HeroCarousel banners={banners} />
      {sections.map((section) => (
        <MustTrySection
          key={section.id}
          title={section.title}
          products={section.products}
          href="/products"
          viewAllLabel={tProducts('viewAll')}
        />
      ))}
    </>
  );
}
