import { customFetch, ApiError } from '@/lib/api/fetcher';
import type {
  ProductListDto,
  ProductResponseDto,
  ProductsControllerFindAllParams,
} from '@/lib/api/generated/ecomAPI.schemas';

/**
 * Server-side fetchers cho products. Generated SWR client (products/products.ts) import
 * `useSwr` ở top-level nên không dùng được trong server component (xem src/features/careers/api.ts
 * — cùng lý do). Types vẫn 100% từ codegen — chỉ call site là viết tay.
 */

export function getProducts(params?: ProductsControllerFindAllParams): Promise<ProductListDto> {
  return customFetch<ProductListDto>({ url: '/products', method: 'GET', params });
}

export async function getProductBySlug(slug: string, locale: string): Promise<ProductResponseDto | null> {
  try {
    return await customFetch<ProductResponseDto>({
      url: `/products/slug/${encodeURIComponent(slug)}`,
      method: 'GET',
      params: { locale },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
