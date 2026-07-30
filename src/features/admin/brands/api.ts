import {
  brandsControllerCreate,
  brandsControllerFindAll,
  brandsControllerRemove,
  brandsControllerUpdate,
} from '@/lib/api/generated/brands/brands';
import type {
  BrandDto,
  BrandsControllerFindAllParams,
  CreateBrandDto,
  UpdateBrandDto,
} from '@/lib/api/generated/ecomAPI.schemas';

export const brandsKey = ['/brands', 'admin'] as const;

/** GET /brands trả trực tiếp BrandDto[], không có object phân trang. */
export async function listBrands(params?: BrandsControllerFindAllParams): Promise<BrandDto[]> {
  return (await brandsControllerFindAll(params)) ?? [];
}

export function createBrand(dto: CreateBrandDto) {
  return brandsControllerCreate(dto);
}

export function updateBrand(id: string, dto: UpdateBrandDto) {
  return brandsControllerUpdate(id, dto);
}

export function deleteBrand(id: string) {
  return brandsControllerRemove(id);
}
