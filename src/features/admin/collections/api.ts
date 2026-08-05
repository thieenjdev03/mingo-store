/**
 * Data-layer admin cho Bộ sưu tập (/collections). List phân trang cursor { items, nextCursor };
 * response chưa document (void) -> tier-2 tự type. Kèm gán/gỡ sản phẩm theo collection.
 */
import {
  collectionsControllerFindAll,
  collectionsControllerCreate,
  collectionsControllerUpdate,
  collectionsControllerRemove,
  collectionsControllerGetProducts,
  collectionsControllerAssignProducts,
  collectionsControllerRemoveProducts,
} from '@/lib/api/generated/collections/collections';
import type { CreateCollectionDto, UpdateCollectionDto } from '@/lib/api/generated/ecomAPI.schemas';

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  is_active: boolean;
  /** Đặt (khác rỗng) => collection thành một khối sản phẩm trên trang chủ. */
  homepage_section?: string;
  product_count?: number;
}

export interface CollectionProduct {
  id: string;
  name: string;
  slug?: string;
  image?: string | null;
}

export const collectionsKey = ['/collections', 'admin'] as const;

export async function listCollections(): Promise<CollectionItem[]> {
  const res = (await collectionsControllerFindAll()) as unknown as { items?: CollectionItem[] } | undefined;
  return res?.items ?? [];
}

export function createCollection(dto: CreateCollectionDto) {
  return collectionsControllerCreate(dto);
}
export function updateCollection(id: string, dto: UpdateCollectionDto) {
  return collectionsControllerUpdate(id, dto);
}
export function deleteCollection(id: string) {
  return collectionsControllerRemove(id);
}

export async function getCollectionProducts(id: string): Promise<CollectionProduct[]> {
  const res = (await collectionsControllerGetProducts(id)) as unknown as
    | CollectionProduct[]
    | { items?: CollectionProduct[]; data?: CollectionProduct[] }
    | undefined;
  if (Array.isArray(res)) return res;
  return res?.items ?? res?.data ?? [];
}
export function assignProducts(id: string, productIds: string[]) {
  return collectionsControllerAssignProducts(id, { productIds });
}
export function removeProducts(id: string, productIds: string[]) {
  return collectionsControllerRemoveProducts(id, { productIds });
}
