/**
 * Fetcher server-side cho policies. Endpoint public:
 *  - GET /policies         -> danh sách active (sidebar), đã sắp theo display_order
 *  - GET /policies/:slug    -> 1 chính sách kèm content HTML (404 -> null)
 */
import {
  policiesPublicControllerFindAll,
  policiesPublicControllerFindBySlug,
} from '@/lib/api/generated/policies/policies';
import { ApiError } from '@/lib/api/fetcher';
import { toPolicyNavItem, toPolicyDetailView, type PolicyNavItem, type PolicyDetailView } from './types';

export async function getPolicies(): Promise<PolicyNavItem[]> {
  const list = await policiesPublicControllerFindAll();
  return (list ?? []).map(toPolicyNavItem);
}

export async function getPolicyBySlug(slug: string): Promise<PolicyDetailView | null> {
  try {
    const dto = await policiesPublicControllerFindBySlug(slug);
    return dto ? toPolicyDetailView(dto) : null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
