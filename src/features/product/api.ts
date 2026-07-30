import { customFetch, ApiError } from '@/lib/api/fetcher';
import type {
  ProductListDto,
  ProductResponseDto,
  ProductsControllerFindAllParams,
} from '@/lib/api/generated/ecomAPI.schemas';

export type ProductDetailApiDto = ProductResponseDto & {
  nutrition_information?: string | null;
};

/**
 * Server-side fetchers cho products. Generated SWR client (products/products.ts) import
 * `useSwr` ở top-level nên không dùng được trong server component (xem src/features/careers/api.ts
 * — cùng lý do). Types vẫn 100% từ codegen — chỉ call site là viết tay.
 */

export function getProducts(params?: ProductsControllerFindAllParams): Promise<ProductListDto> {
  return customFetch<ProductListDto>({ url: '/products', method: 'GET', params, cache: 'no-store' });
}

export async function getProductBySlug(slug: string, locale: string): Promise<ProductDetailApiDto | null> {
  try {
    return await customFetch<ProductDetailApiDto>({
      url: `/products/slug/${encodeURIComponent(slug)}`,
      method: 'GET',
      params: { locale },
      cache: 'no-store',
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

interface CollectionApiItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
}

export interface CollectionCatalog {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: ProductResponseDto[];
}

export async function getCollectionCatalog(
  slug: string,
  locale: string,
): Promise<CollectionCatalog | null> {
  const collections = await customFetch<CursorPage<CollectionApiItem>>({
    url: '/collections',
    method: 'GET',
    params: { limit: 100, locale },
    cache: 'no-store',
  });
  const collection = collections.items.find(
    (item) => item.slug === slug && item.is_active !== false,
  );
  if (!collection) return null;

  const products = await customFetch<CursorPage<ProductResponseDto>>({
    url: `/collections/${encodeURIComponent(collection.id)}/products`,
    method: 'GET',
    params: { limit: 100, locale },
    cache: 'no-store',
  });

  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? null,
    products: products.items,
  };
}
