// Data-access layer for the store locator, backed by the Distributors API
// (ecom-website: src/modules/distributors). Province/ward data comes from the
// static `vietnam-address-data` bundle — no runtime address fetch (see spec).

import { provinces, getWardsByProvince } from '@/lib/vn-address';
import type { Province, Ward } from '@/lib/vn-address';
// Gọi customFetch trực tiếp thay vì qua `@/lib/api/generated/**`: các module generated
// export kèm SWR hook, import chúng từ Server Component sẽ kéo `swr` vào server bundle.
import { customFetch } from '@/lib/api/fetcher';
import type { DistributorDto } from '@/lib/api/generated/ecomAPI.schemas';

export type { Province, Ward };
export { provinces, getWardsByProvince };

export type Store = DistributorDto;

export interface StoreFilters {
  province_code?: string;
  ward_code?: string;
  category_id?: string;
}

export async function getStores(filters: StoreFilters = {}): Promise<Store[]> {
  const res = await customFetch<{ data?: Store[] }>({
    url: '/distributors',
    method: 'GET',
    params: {
      province_code: filters.province_code || undefined,
      ward_code: filters.ward_code || undefined,
      category_id: filters.category_id || undefined,
      limit: 100,
    },
    next: { revalidate: 300 },
  });
  return res?.data ?? [];
}

export interface CategoryOption {
  id: string;
  name: string;
}

// `/categories` wraps its own { success, data, meta } envelope inside the global
// TransformInterceptor envelope — customFetch only unwraps the outer one.
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const res = await customFetch<{ data?: Array<{ id: string; name: string }> }>({
    url: '/categories',
    method: 'GET',
    params: { with_children_count: 'false', page: '1', limit: '100' },
    next: { revalidate: 300 },
  });
  return (res?.data ?? []).map((c) => ({ id: c.id, name: c.name }));
}
