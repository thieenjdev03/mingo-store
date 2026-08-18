import type { MediaAssetVM, MediaLibraryPageVM } from './types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function toMediaAsset(value: unknown): MediaAssetVM | null {
  const asset = asRecord(value);
  if (!asset || typeof asset.url !== 'string') return null;

  return {
    publicId: typeof asset.public_id === 'string' ? asset.public_id : asset.url,
    url: asset.url,
    thumbnailUrl: typeof asset.thumbnail_url === 'string' ? asset.thumbnail_url : asset.url,
    format: typeof asset.format === 'string' ? asset.format : '',
    bytes: typeof asset.bytes === 'number' ? asset.bytes : 0,
    width: typeof asset.width === 'number' ? asset.width : null,
    height: typeof asset.height === 'number' ? asset.height : null,
    createdAt: typeof asset.created_at === 'string' ? asset.created_at : '',
  };
}

export function toMediaLibraryPage(value: unknown): MediaLibraryPageVM {
  const response = asRecord(value);
  const items = Array.isArray(response?.items)
    ? response.items.map(toMediaAsset).filter((asset): asset is MediaAssetVM => asset !== null)
    : [];

  return {
    items,
    nextCursor: typeof response?.next_cursor === 'string' ? response.next_cursor : null,
  };
}
