/**
 * Option {id,name} cho các select/multiselect admin (category, collection).
 * `/categories` bọc envelope kép, `/collections` phân trang cursor { items } — xử lý tại đây.
 */
import { categoriesControllerGetCategories } from '@/lib/api/generated/categories/categories';
import { collectionsControllerFindAll } from '@/lib/api/generated/collections/collections';

export interface Option {
  id: string;
  name: string;
}

export async function getCategoryOptions(): Promise<Option[]> {
  const res = (await categoriesControllerGetCategories({
    with_children_count: 'false',
    page: '1',
    limit: '100',
  })) as { data?: Array<{ id: string; name: string }> } | undefined;
  return (res?.data ?? []).map((c) => ({ id: c.id, name: c.name }));
}

export async function getCollectionOptions(): Promise<Option[]> {
  const res = (await collectionsControllerFindAll()) as unknown as
    | { items?: Array<{ id: string; name: string }> }
    | undefined;
  return (res?.items ?? []).map((c) => ({ id: c.id, name: c.name }));
}
