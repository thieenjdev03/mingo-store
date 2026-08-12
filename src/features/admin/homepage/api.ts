/**
 * Data-layer admin cho Banner trang chủ (/homepage/banners).
 * Response findAll chưa được backend document (void) -> tier-2 tự khai báo BannerDto và cast.
 */
import {
  homepageBannersControllerFindAll,
  homepageBannersControllerCreate,
  homepageBannersControllerUpdate,
  homepageBannersControllerRemove,
} from '@/lib/api/generated/homepage/homepage';
import type { CreateHomepageBannerDto } from '@/lib/api/generated/ecomAPI.schemas';

export interface BannerDto {
  id: string;
  image_url: string;
  /** Video nền tuỳ chọn (mp4). Có -> storefront phát autoplay/muted/loop, image_url làm poster. */
  video_url?: string | null;
  alt_text?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
}

// `video_url` post-date lần gen openapi gần nhất (backend vừa thêm) nên chưa có trong
// CreateHomepageBannerDto generated — mở rộng ở đây và cast ở call site (giống pattern hand-declared của feature này).
export type SaveBannerInput = Omit<CreateHomepageBannerDto, 'video_url'> & {
  video_url?: string | null;
};

export const bannersKey = ['/homepage/banners'] as const;

export async function listBanners(): Promise<BannerDto[]> {
  const res = await homepageBannersControllerFindAll();
  return (res as unknown as BannerDto[] | undefined) ?? [];
}

export function createBanner(dto: SaveBannerInput) {
  return homepageBannersControllerCreate(dto as CreateHomepageBannerDto);
}
export function updateBanner(id: string, dto: Partial<SaveBannerInput>) {
  return homepageBannersControllerUpdate(id, dto as Partial<CreateHomepageBannerDto>);
}
export function deleteBanner(id: string) {
  return homepageBannersControllerRemove(id);
}
