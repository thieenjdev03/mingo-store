import type { ProductCardView } from '@/features/product/types';

/**
 * TẦNG 1 (khai báo tay) — shape của GET /collections/homepage.
 * Endpoint này được backend thêm sau lần generate openapi gần nhất nên chưa có
 * trong `@/lib/api/generated`; khai báo ở đây và gọi qua customFetch (giống pattern
 * hiện có của feature). Backend đã resolve locale => name/slug/description là string thuần.
 */
export interface HomepageProductTileDto {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  sale_price: number | null;
  image: string | null;
  images: string[];
  stock_quantity: number;
  status: string;
  is_featured: boolean;
  enable_sale_tag: boolean;
}

export interface HomepageSectionDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  homepage_section: string;
  product_count: number;
  products: HomepageProductTileDto[];
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
  /** Tổng số sản phẩm của collection (không chỉ số tile được preview). */
  productCount: number;
  products: ProductCardView[];
}

export interface StorefrontHomeView {
  heroes: HeroBannerView[];
  sections: HomeCollectionView[];
}

/**
 * Tile trang chủ có shape gọn hơn ProductResponseDto (không có variants/compare_at_price),
 * nên map riêng thay vì dùng toProductCardView. Giá hiệu lực = sale_price ?? price.
 */
function toTileCardView(tile: HomepageProductTileDto): ProductCardView {
  const effectivePrice = Number(tile.sale_price ?? tile.price);
  const onSale =
    tile.enable_sale_tag &&
    tile.sale_price != null &&
    Number(tile.price) > Number(tile.sale_price);
  return {
    id: tile.id,
    slug: tile.slug,
    name: tile.name,
    image: tile.image ?? tile.images[0] ?? null,
    price: effectivePrice,
    compareAtPrice: onSale ? Number(tile.price) : null,
    stock: Number(tile.stock_quantity),
    available: tile.status === 'active' && Number(tile.stock_quantity) > 0,
    spec: null,
    specOutOfStock: false,
    priceOnRequest: tile.is_featured === true,
  };
}

export function toHomeSectionsView(
  sections: HomepageSectionDto[],
): HomeCollectionView[] {
  return sections
    .map((section) => ({
      id: section.id,
      slug: section.slug,
      title: section.name,
      description: section.description ?? null,
      homepageSection: section.homepage_section ?? '',
      productCount: section.product_count,
      products: section.products.map(toTileCardView),
    }))
    // Backend lọc `homepage_section IS NOT NULL`, nhưng admin "gỡ khỏi trang chủ"
    // lưu chuỗi rỗng => phòng thủ ở đây, và bỏ khối không có sản phẩm để hiển thị.
    .filter((section) => section.homepageSection.trim() !== '' && section.products.length > 0);
}
