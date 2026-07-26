/**
 * TẦNG 2 — View model của feature home (landing page).
 * Components chỉ nhận type ở đây. Must-try products dùng lại
 * ProductCardView/toProductCardView của feature product (không tạo mapper riêng)
 * để tránh trùng lặp dữ liệu sản phẩm — xem docs/plans/ladning-page-plan.md §13.
 */

export interface HeroBannerView {
  id: string;
  imageUrl: string;
  alt: string;
  linkUrl: string | null;
}

/** Raw shape trả về từ GET /homepage/banners (generated client type là `void` vì backend chưa khai báo @ApiOkResponse type). */
export interface HomepageBannerDto {
  id: string;
  image_url: string;
  alt_text: string | null;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
}

export function toHeroBannerView(b: HomepageBannerDto): HeroBannerView {
  return {
    id: b.id,
    imageUrl: b.image_url,
    alt: b.alt_text ?? '',
    linkUrl: b.link_url ?? null,
  };
}
