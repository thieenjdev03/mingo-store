import { customFetch } from '@/lib/api/fetcher';
import type {
  CareerDto,
  CareerListDto,
  CareersControllerFindAllParams,
} from '@/lib/api/generated/ecomAPI.schemas';

/**
 * Server-side fetchers cho careers. Generated SWR client (careers/careers.ts)
 * import `useSwr` ở top-level nên không dùng được trong server component
 * (swr bản react-server không có default export). Types vẫn 100% từ codegen —
 * chỉ call site là viết tay. Client component thì dùng thẳng generated hooks.
 */
export function getCareers(params?: CareersControllerFindAllParams): Promise<CareerListDto> {
  return customFetch<CareerListDto>({ url: '/careers', method: 'GET', params, cache: 'no-store' });
}

export function getCareerBySlug(slug: string): Promise<CareerDto> {
  return customFetch<CareerDto>({ url: `/careers/${encodeURIComponent(slug)}`, method: 'GET', cache: 'no-store' });
}
