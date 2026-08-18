import { ApiError, customFetch } from '@/lib/api/fetcher';
import type { BrandDto } from '@/lib/api/generated/ecomAPI.schemas';

export interface StorefrontBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

/** Server-side fetcher cho trang danh sách sản phẩm theo thương hiệu. */
export async function getBrandBySlug(slug: string): Promise<BrandDto | null> {
  try {
    return await customFetch<BrandDto>({
      url: `/brands/slug/${encodeURIComponent(slug)}`,
      method: 'GET',
      // TODO(cache): bật lại sau khi test xong
      // next: { revalidate: 300 },
      cache: 'no-store',
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Danh sách thương hiệu dùng cho homepage và trang thương hiệu. */
export async function getStorefrontBrands(): Promise<StorefrontBrand[]> {
  const brands = await customFetch<BrandDto[]>({
    url: '/brands',
    method: 'GET',
    params: { active: true },
    // TODO(cache): bật lại sau khi test xong
    // next: { revalidate: 300 },
    cache: 'no-store',
  });

  return (brands ?? [])
    .filter((brand) => brand.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo_url ?? null,
    }));
}
