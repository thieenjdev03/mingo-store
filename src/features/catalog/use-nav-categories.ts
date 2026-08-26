'use client';

import useSWR from 'swr';
import { fetchNavCategories, type CategoryNavItem } from './nav-data';

export type { CategoryNavItem };

/**
 * Danh mục sản phẩm cho dropdown "Dòng sản phẩm" ở header. Rỗng khi API lỗi/chưa có dữ liệu.
 */
export function useNavCategories(): CategoryNavItem[] {
  const { data } = useSWR('nav-categories', fetchNavCategories, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  return data ?? [];
}
