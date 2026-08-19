import { customFetch } from '@/lib/api/fetcher';
import type { Locale } from '@/types/localized';
import {
  toHeroBannerView,
  toHomeSectionsView,
  type CursorPage,
  type HeroBannerView,
  type HomeCollectionView,
  type HomepageCollectionDto,
  type HomepageBannerDto,
  type StorefrontHomeView,
} from './types';
import type { ProductResponseDto } from '@/lib/api/generated/ecomAPI.schemas';

/** Số sản phẩm preview lấy cho mỗi khối trang chủ (backend giới hạn 1..24). */
const HOME_TILES_PER_SECTION = 12;

/** Các collection active đã được admin đánh dấu hiển thị ở trang chủ. */
async function fetchHomeSections(locale: Locale): Promise<HomeCollectionView[]> {
  const collections: HomepageCollectionDto[] = [];
  let cursor: string | undefined;

  do {
    const page = await customFetch<CursorPage<HomepageCollectionDto>>({
      url: '/collections',
      method: 'GET',
      params: { locale, limit: 100, ...(cursor ? { cursor } : {}) },
      next: { revalidate: 300 },
    });
    collections.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  const homeCollections = collections.filter(
    (collection) => collection.is_active && Boolean(collection.homepage_section?.trim()),
  );
  const productEntries = await Promise.all(
    homeCollections.map(async (collection) => {
      const page = await customFetch<CursorPage<ProductResponseDto>>({
        url: `/collections/${encodeURIComponent(collection.id)}/products`,
        method: 'GET',
        params: { locale, limit: HOME_TILES_PER_SECTION },
        next: { revalidate: 300 },
      }).catch(() => ({ items: [], nextCursor: null }));
      return [collection.id, page.items] as const;
    }),
  );

  return toHomeSectionsView(homeCollections, new Map(productEntries), locale);
}

/** Hero banner do admin quản lý (GET /homepage/banners?active=true, đã sort theo display_order). */
async function fetchHeroBanners(): Promise<HeroBannerView[]> {
  const banners = await customFetch<HomepageBannerDto[]>({
    url: '/homepage/banners',
    method: 'GET',
    params: { active: true },
    next: { revalidate: 300 },
  });
  return banners
    .filter((banner) => banner.is_active && banner.image_url)
    .sort((a, b) => a.display_order - b.display_order)
    .map(toHeroBannerView);
}

/**
 * Dữ liệu trang chủ: hero banner từ backend + các khối sản phẩm theo bộ sưu tập.
 * Hai nguồn độc lập — một nguồn lỗi không làm hỏng nguồn kia (banner cứng ở carousel vẫn hiển thị).
 */
export async function getStorefrontHome(
  locale: Locale,
): Promise<StorefrontHomeView> {
  const [heroes, sections] = await Promise.all([
    fetchHeroBanners().catch(() => [] as HeroBannerView[]),
    fetchHomeSections(locale).catch(() => [] as HomeCollectionView[]),
  ]);
  return { heroes, sections };
}
