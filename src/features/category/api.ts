import { ApiError, customFetch } from '@/lib/api/fetcher';

/**
 * TẦNG 1 (khai báo tay) — response của GET /categories/slug/{slug}.
 * Endpoint chưa được backend gõ kiểu (orval sinh ra `void`), nên khai báo shape
 * tối thiểu cần dùng ở đây. Category là varchar phẳng => name/slug/description là string thuần.
 */
interface CategoryDetailDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/** Chi tiết category theo slug — dùng để hiển thị tên + mô tả trên banner trang category. */
export async function getCategoryBySlug(slug: string): Promise<StorefrontCategory | null> {
  try {
    const category = await customFetch<CategoryDetailDto>({
      url: `/categories/slug/${encodeURIComponent(slug)}`,
      method: 'GET',
      // TODO(cache): bật lại sau khi test xong
      // next: { revalidate: 300 },
      cache: 'no-store',
    });
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description?.trim() || null,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
