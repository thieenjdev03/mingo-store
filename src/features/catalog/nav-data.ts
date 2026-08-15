/**
 * Nguồn dữ liệu dùng chung cho danh sách "Thương hiệu" và "Dòng sản phẩm" (categories)
 * hiển thị ở header (client, qua SWR) lẫn footer (server component, fetch trực tiếp).
 * `customFetch` chạy được cả hai phía (token = null trên server; đây là read công khai).
 */
import { customFetch } from '@/lib/api/fetcher';
import { BRANDS } from '@/config/brands';
import { MOCKUP_CATEGORIES } from '@/features/product/mockup-catalog';
import { resolveLocalized, type Locale } from '@/types/localized';

export interface BrandNavItem {
  name: string;
  slug: string;
  /** URL logo (Cloudinary từ backend, hoặc file tĩnh ở fallback local). null = chưa có logo. */
  logoUrl: string | null;
}

export interface CategoryNavItem {
  name: string;
  slug: string;
}

interface RawBrand {
  name: string;
  slug: string;
  logo_url?: string | null;
  is_active?: boolean;
  display_order?: number;
}

interface RawCategory {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
  display_order?: number;
}

// Gọi thẳng customFetch thay vì import module orval sinh ra: các file generated import `swr`
// (chạm `window` lúc load) nên không import được vào Server Component (footer) — sẽ lỗi RSC.

/** Thương hiệu thật từ API — slug khớp product.brand.slug để lọc ở /brands/[slug]. */
export async function fetchNavBrands(): Promise<BrandNavItem[]> {
  const brands = await customFetch<RawBrand[]>({
    url: '/brands',
    method: 'GET',
    params: { active: true },
    next: { revalidate: 300 },
  });

  return (brands ?? [])
    .filter((b) => b.is_active !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((b) => ({ name: b.name, slug: b.slug, logoUrl: b.logo_url ?? null }));
}

/** Thương hiệu local (config BRANDS) làm fallback khi backend chưa seed brands. */
export function localNavBrands(): BrandNavItem[] {
  return BRANDS.map((b) => ({ name: b.name, slug: b.slug, logoUrl: b.logo }));
}

export async function fetchNavCategories(): Promise<CategoryNavItem[]> {
  // Dùng endpoint công khai `/categories/active` (chỉ category đang active, trả mảng phẳng)
  // thay vì `/categories` (admin, kèm cả inactive + envelope { data, meta } lồng 2 lớp).
  // TransformInterceptor bọc mảng thành { success, data } -> customFetch unwrap -> mảng trần.
  const categories = await customFetch<RawCategory[]>({
    url: '/categories/active',
    method: 'GET',
    next: { revalidate: 300 },
  });

  return (categories ?? [])
    .filter((c) => c.is_active !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((c) => ({ name: c.name, slug: c.slug }));
}

/** Danh mục local (nhóm Mingo) làm fallback khi backend chưa seed categories. */
export function localNavCategories(locale: Locale): CategoryNavItem[] {
  return MOCKUP_CATEGORIES.map((c) => ({ name: resolveLocalized(c.name, locale), slug: c.slug }));
}
