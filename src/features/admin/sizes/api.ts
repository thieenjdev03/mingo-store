import { customFetch } from '@/lib/api/fetcher';
import type { AdminSizeView, SaveSizeInput } from './types';

interface ListSizesParams {
  categoryId?: string;
}

export function sizesKey(params?: ListSizesParams) {
  return ['/sizes', params ?? {}] as const;
}
export function listSizes(params?: ListSizesParams) {
  return customFetch<AdminSizeView[]>({
    url: '/sizes',
    method: 'GET',
    params: params ? { ...params } : undefined,
  });
}
export function createSize(dto: SaveSizeInput) {
  return customFetch<AdminSizeView>({ url: '/sizes', method: 'POST', data: dto });
}
export function updateSize(id: string, dto: Partial<SaveSizeInput>) {
  return customFetch<AdminSizeView>({ url: `/sizes/${id}`, method: 'PATCH', data: dto });
}
export function deleteSize(id: string) {
  return customFetch<void>({ url: `/sizes/${id}`, method: 'DELETE' });
}
