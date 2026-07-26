'use client';

import useSWR from 'swr';
import { useLocale } from 'next-intl';
import { categoriesControllerGetCategories } from '@/lib/api/generated/categories/categories';
import { MOCKUP_CATEGORIES } from '@/features/product/mockup-catalog';
import { resolveLocalized, type Locale } from '@/types/localized';

export interface CategoryNavItem {
  name: string;
  slug: string;
}

interface RawCategory {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
  display_order?: number;
}

async function fetchNavCategories(): Promise<CategoryNavItem[]> {
  // `/categories` bọc envelope { success, data, meta } của riêng nó bên trong envelope
  // TransformInterceptor toàn cục — customFetch chỉ unwrap lớp ngoài (xem features/distribution/data.ts).
  const res = (await categoriesControllerGetCategories({
    with_children_count: 'false',
    page: '1',
    limit: '100',
  })) as { data?: RawCategory[] } | undefined;

  return (res?.data ?? [])
    .filter((c) => c.is_active !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((c) => ({ name: c.name, slug: c.slug }));
}

/** Danh mục local (11 nhóm Mingo) làm fallback khi backend chưa seed categories. */
function localNavCategories(locale: Locale): CategoryNavItem[] {
  return MOCKUP_CATEGORIES.map((c) => ({ name: resolveLocalized(c.name, locale), slug: c.slug }));
}

/**
 * Danh mục sản phẩm cho dropdown "Dòng sản phẩm" ở header.
 * Ưu tiên dữ liệu thật từ API; nếu rỗng (backend chưa seed) hoặc đang lỗi -> fallback danh mục local.
 */
export function useNavCategories(): CategoryNavItem[] {
  const locale = useLocale() as Locale;
  const { data } = useSWR('nav-categories', fetchNavCategories, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  return data && data.length > 0 ? data : localNavCategories(locale);
}
