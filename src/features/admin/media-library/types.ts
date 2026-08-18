export interface MediaAssetVM {
  publicId: string;
  url: string;
  thumbnailUrl: string;
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface MediaLibraryPageVM {
  items: MediaAssetVM[];
  nextCursor: string | null;
}
