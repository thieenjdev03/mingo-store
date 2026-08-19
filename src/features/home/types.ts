import type { ProductResponseDto } from '@/lib/api/generated/ecomAPI.schemas';
import {
  isPublicCatalogProduct,
  toProductCardView,
  type ProductCardView,
} from '@/features/product/types';
import type { Locale } from '@/types/localized';

/**
 * TẦNG 1 — collection từ GET /collections. API bọc kết quả trong cursor page
 * `{ items, nextCursor }`; các sản phẩm preview được lấy riêng theo collection id.
 */
export interface HomepageCollectionDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  homepage_section: string | null;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

/** TẦNG 1 — shape của GET /homepage/banners (findAll chưa được backend gõ kiểu, tự khai báo). */
export interface HomepageBannerDto {
  id: string;
  image_url: string;
  /** Video nền tuỳ chọn (mp4). Có -> hero phát autoplay/muted/loop, image_url làm poster. */
  video_url?: string | null;
  alt_text?: string | null;
  link_url?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface HeroBannerView {
  id: string;
  imageUrl: string;
  mobileImageUrl: string | null;
  /** Video nền (mp4) nếu admin cấu hình; null -> dùng ảnh tĩnh. */
  videoUrl: string | null;
  alt: string;
  ctaLabel: string | null;
  linkUrl: string;
}

export function toHeroBannerView(banner: HomepageBannerDto): HeroBannerView {
  return {
    id: banner.id,
    imageUrl: banner.image_url,
    mobileImageUrl: null,
    videoUrl: banner.video_url ?? null,
    alt: banner.alt_text ?? '',
    // Banner backend chưa có nhãn CTA riêng — carousel sẽ dùng nhãn mặc định.
    ctaLabel: null,
    linkUrl: banner.link_url ?? '/products',
  };
}

export interface HomeCollectionView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  /** Mã khối trang chủ (homepage_section) mà collection này đại diện. */
  homepageSection: string;
  /** Số sản phẩm đang hiển thị trong carousel preview. */
  productCount: number;
  products: ProductCardView[];
}

export interface StorefrontHomeView {
  heroes: HeroBannerView[];
  sections: HomeCollectionView[];
}

export function toHomeSectionsView(
  collections: HomepageCollectionDto[],
  productsByCollectionId: ReadonlyMap<string, ProductResponseDto[]>,
  locale: Locale,
): HomeCollectionView[] {
  return collections
    .map((collection) => {
      const products = productsByCollectionId.get(collection.id) ?? [];
      return {
        id: collection.id,
        slug: collection.slug,
        title: collection.name,
        description: collection.description ?? null,
        homepageSection: collection.homepage_section ?? '',
        productCount: products.length,
        products: products
          .filter(isPublicCatalogProduct)
          .map((product) => toProductCardView(product, locale)),
      };
    })
    // Admin "gỡ khỏi trang chủ" lưu chuỗi rỗng; bỏ collection không active hoặc
    // không có sản phẩm công khai để không tạo một khối rỗng trên storefront.
    .filter((section) =>
      section.homepageSection.trim() !== '' &&
      section.products.length > 0 &&
      section.slug.trim().toLowerCase() !== 'test' &&
      section.title.trim().toLowerCase() !== 'test'
    );
}
