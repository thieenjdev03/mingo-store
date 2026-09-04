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
  image_url?: string | null;
  /** Video nền tuỳ chọn (mp4). Có -> storefront phát autoplay/muted/loop, image_url làm poster. */
  video_url?: string | null;
  alt_text?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
}

// Contract admin cho phép `image_url`/`video_url` dùng độc lập: banner chỉ cần
// có ít nhất một loại media. Generated DTO cũ vẫn yêu cầu image_url nên mở rộng
// type ở đây và cast ở call site.
export type SaveBannerInput = Omit<CreateHomepageBannerDto, 'image_url' | 'video_url'> & {
  image_url?: string | null;
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
