/**
 * Data-layer admin cho Danh mục (/categories). Response chưa document (void) -> tier-2 tự type.
 * List bọc envelope kép { data: { data:[...], meta } } — customFetch unwrap lớp ngoài, còn .data là mảng.
 */
import {
  categoriesControllerCreate,
  categoriesControllerUpdate,
  categoriesControllerRemove,
  categoriesControllerGetCategories,
} from '@/lib/api/generated/categories/categories';
import type { CreateCategoryDto, UpdateCategoryDto } from '@/lib/api/generated/ecomAPI.schemas';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent?: { id: string; name?: string } | string | null;
  parent_name?: string;
  display_order: number;
  is_active: boolean;
}

/** parent_id hiện tại của 1 category (đọc linh hoạt vì backend trả object/string/null). */
export function categoryParentId(c: CategoryItem): string | null {
  if (!c.parent) return null;
  return typeof c.parent === 'string' ? c.parent : (c.parent.id ?? null);
}

export const categoriesKey = ['/categories', 'admin'] as const;

export async function listCategories(): Promise<CategoryItem[]> {
  const res = (await categoriesControllerGetCategories({
    with_children_count: 'false',
    page: '1',
    limit: '200',
  })) as { data?: CategoryItem[] } | undefined;
  return res?.data ?? [];
}

export function createCategory(dto: CreateCategoryDto) {
  return categoriesControllerCreate(dto);
}
export function updateCategory(id: string, dto: UpdateCategoryDto) {
  return categoriesControllerUpdate(id, dto);
}
export function deleteCategory(id: string) {
  return categoriesControllerRemove(id);
}
