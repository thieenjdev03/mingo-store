import { customFetch } from '@/lib/api/fetcher';
import type { Locale } from '@/types/localized';
import {
  toHeroBannerView,
  toHomeSectionsView,
  type HeroBannerView,
  type HomeCollectionView,
  type HomepageBannerDto,
  type HomepageSectionDto,
  type StorefrontHomeView,
} from './types';

/** Số sản phẩm preview lấy cho mỗi khối trang chủ (backend giới hạn 1..24). */
const HOME_TILES_PER_SECTION = 12;

/** Các khối sản phẩm theo bộ sưu tập (collection active có homepage_section). */
async function fetchHomeSections(locale: Locale): Promise<HomeCollectionView[]> {
  const sections = await customFetch<HomepageSectionDto[]>({
    url: '/collections/homepage',
    method: 'GET',
    params: { locale, limit: HOME_TILES_PER_SECTION },
    // TODO(cache): bật lại sau khi test xong
    // next: { revalidate: 300 },
    cache: 'no-store',
  });
  return toHomeSectionsView(sections);
}

/** Hero banner do admin quản lý (GET /homepage/banners?active=true, đã sort theo display_order). */
async function fetchHeroBanners(): Promise<HeroBannerView[]> {
  const banners = await customFetch<HomepageBannerDto[]>({
    url: '/homepage/banners',
    method: 'GET',
    params: { active: true },
    // TODO(cache): bật lại sau khi test xong
    // next: { revalidate: 300 },
    cache: 'no-store',
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
