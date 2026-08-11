'use client';

import useSWR from 'swr';
import { fetchNavBrands, localNavBrands, type BrandNavItem } from './nav-data';

export type { BrandNavItem };

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
