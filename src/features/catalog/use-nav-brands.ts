'use client';

import useSWR from 'swr';
import { brandsControllerFindAll } from '@/lib/api/generated/brands/brands';
import { BRANDS } from '@/config/brands';

export interface BrandNavItem {
  name: string;
  slug: string;
}

async function fetchNavBrands(): Promise<BrandNavItem[]> {
  // `brandsControllerFindAll` là fetch thuần (không phải hook) nên gọi được trong SWR fetcher —
  // cùng cách useNavCategories gọi categoriesControllerGetCategories.
  const brands = await brandsControllerFindAll({ active: true });

  return (brands ?? [])
    .filter((b) => b.is_active !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((b) => ({ name: b.name, slug: b.slug }));
}

/** Thương hiệu local (config BRANDS) làm fallback khi backend chưa seed brands. */
function localNavBrands(): BrandNavItem[] {
  return BRANDS.map((b) => ({ name: b.name, slug: b.slug }));
}

/**
 * Thương hiệu cho dropdown "Thương hiệu" ở header.
 * Ưu tiên dữ liệu thật từ API (slug khớp với product.brand.slug để lọc sản phẩm ở trang /brands/[slug]);
 * nếu rỗng hoặc đang lỗi -> fallback danh sách brand local.
 */
export function useNavBrands(): BrandNavItem[] {
  const { data } = useSWR('nav-brands', fetchNavBrands, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  return data && data.length > 0 ? data : localNavBrands();
}
