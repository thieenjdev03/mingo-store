import { customFetch } from '@/lib/api/fetcher';
import { toMediaLibraryPage } from './mappers';
import type { MediaLibraryPageVM } from './types';

export const mediaLibraryKey = (nextCursor: string | null) =>
  ['/files/library', 'products', nextCursor] as const;

export async function listMediaAssets(nextCursor?: string | null): Promise<MediaLibraryPageVM> {
  const response = await customFetch<unknown>({
    url: '/files/library',
    method: 'GET',
    params: {
      folder: 'products',
      maxResults: 60,
      nextCursor: nextCursor || undefined,
    },
  });
  return toMediaLibraryPage(response);
}

export async function uploadMediaAssets(files: File[]): Promise<void> {
  const data = new FormData();
  files.forEach((file) => data.append('files', file));
  data.append('folder', 'products');
  await customFetch<unknown>({
    url: '/files/upload-multiple',
    method: 'POST',
    data,
  });
}
