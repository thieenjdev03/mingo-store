import { customFetch, ApiError } from '@/lib/api/fetcher';
import type {
  ProductListDto,
  ProductResponseDto,
  ProductsControllerFindAllParams,
} from '@/lib/api/generated/ecomAPI.schemas';
import { isPublicCatalogProduct } from './types';

export type ProductDetailApiDto = ProductResponseDto & {
  nutrition_information?: string | null;
  usage_instructions?: string | null;
  notes?: string | null;
};

/**
 * Server-side fetchers cho products. Generated SWR client (products/products.ts) import
 * `useSwr` ở top-level nên không dùng được trong server component (xem src/features/careers/api.ts
 * — cùng lý do). Types vẫn 100% từ codegen — chỉ call site là viết tay.
 */

export function getProducts(params?: ProductsControllerFindAllParams): Promise<ProductListDto> {
  return customFetch<ProductListDto>({ url: '/products', method: 'GET', params, next: { revalidate: 300 } });
}

/** Fetch the complete product list for catalog pages that do not expose pagination controls. */
export async function getAllProducts(
  params: Omit<ProductsControllerFindAllParams, 'page' | 'limit'> = {},
): Promise<ProductResponseDto[]> {
  const limit = 100;
  const first = await getProducts({ ...params, page: 1, limit });
  const totalPages = Math.max(1, first.meta?.totalPages ?? 1);
  if (totalPages === 1) return first.data.filter(isPublicCatalogProduct);

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getProducts({ ...params, page: index + 2, limit }),
    ),
  );
  return [first, ...rest].flatMap((page) => page.data).filter(isPublicCatalogProduct);
}

/**
 * Sản phẩm cùng category — dùng cho khối "Gợi ý cho bạn" ở PDP.
 * Trả trang đầu (status active); call site tự loại sản phẩm đang xem.
 */
export async function getProductsByCategory(
  categoryId: string,
  locale: string,
  limit = 12,
): Promise<ProductResponseDto[]> {
  const res = await customFetch<ProductListDto>({
    url: '/products',
    method: 'GET',
    params: {
      category_id: categoryId,
      status: 'active',
      locale: locale as ProductsControllerFindAllParams['locale'],
      page: 1,
      limit,
    },
    cache: 'no-store',
  });
  return res.data;
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
    next: { revalidate: 300 },
  });
  const collection = collections.items.find(
    (item) => item.slug === slug && item.is_active !== false,
  );
  if (!collection) return null;

  const products: ProductResponseDto[] = [];
  let cursor: string | undefined;
  do {
    const page = await customFetch<CursorPage<ProductResponseDto>>({
      url: `/collections/${encodeURIComponent(collection.id)}/products`,
      method: 'GET',
      params: { limit: 100, locale, ...(cursor ? { cursor } : {}) },
      next: { revalidate: 300 },
    });
    products.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? null,
    products,
  };
}
