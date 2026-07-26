import { customFetch } from '@/lib/api/fetcher';
import type { ProductResponseDto } from '@/lib/api/generated/ecomAPI.schemas';
import type { HomepageBannerDto } from './types';

/**
 * Server-side fetchers cho homepage content. Generated SWR client (collections/collections.ts,
 * homepage/homepage.ts) import `useSwr` ở top-level nên không dùng được trong server component
 * (xem src/features/careers/api.ts — cùng lý do). Types vẫn theo đúng shape API trả về —
 * chỉ call site là viết tay.
 */

interface CursorPaginated<T> {
  items: T[];
  nextCursor: string | null;
}

export function getActiveHomepageBanners(): Promise<HomepageBannerDto[]> {
  return customFetch<HomepageBannerDto[]>({
    url: '/homepage/banners',
    method: 'GET',
    params: { active: true },
  });
}

export interface CollectionSummary {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
  homepage_section?: string | null;
}

/** Collections đang active do admin tạo — dùng để dựng các section sản phẩm ở trang chủ. */
export function getActiveCollections(): Promise<CollectionSummary[]> {
  return customFetch<CursorPaginated<CollectionSummary>>({
    url: '/collections',
    method: 'GET',
    params: { limit: 20 },
  }).then((res) => res.items.filter((c) => c.is_active !== false));
}

export function getCollectionProducts(
  collectionId: string,
  params: { limit: number; locale: string },
): Promise<ProductResponseDto[]> {
  return customFetch<CursorPaginated<ProductResponseDto>>({
    url: `/collections/${collectionId}/products`,
    method: 'GET',
    params,
  }).then((res) => res.items);
}
