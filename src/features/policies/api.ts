/**
 * Fetcher server-side cho policies. Endpoint public:
 *  - GET /policies         -> danh sách active (sidebar), đã sắp theo display_order
 *  - GET /policies/:slug    -> 1 chính sách kèm content HTML (404 -> null)
 */
import type { PolicyDto, PolicyListItemDto } from '@/lib/api/generated/ecomAPI.schemas';
import { ApiError, customFetch } from '@/lib/api/fetcher';
import { toPolicyNavItem, toPolicyDetailView, type PolicyNavItem, type PolicyDetailView } from './types';

export async function getPolicies(): Promise<PolicyNavItem[]> {
  const list = await customFetch<PolicyListItemDto[]>({ url: '/policies', method: 'GET', cache: 'no-store' /* TODO(cache): bật lại sau khi test xong: next: { revalidate: 300 } */ });
  return (list ?? []).map(toPolicyNavItem);
}

export async function getPolicyBySlug(slug: string): Promise<PolicyDetailView | null> {
  try {
    const dto = await customFetch<PolicyDto>({ url: `/policies/${encodeURIComponent(slug)}`, method: 'GET', cache: 'no-store' /* TODO(cache): bật lại sau khi test xong: next: { revalidate: 300 } */ });
    return dto ? toPolicyDetailView(dto) : null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
