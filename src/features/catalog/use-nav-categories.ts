'use client';

import useSWR from 'swr';
import { useLocale } from 'next-intl';
import { fetchNavCategories, localNavCategories, type CategoryNavItem } from './nav-data';
import type { Locale } from '@/types/localized';

export type { CategoryNavItem };

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
