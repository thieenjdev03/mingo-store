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
  alt_text?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
}

export const bannersKey = ['/homepage/banners'] as const;

export async function listBanners(): Promise<BannerDto[]> {
  const res = await homepageBannersControllerFindAll();
  return (res as unknown as BannerDto[] | undefined) ?? [];
}

export function createBanner(dto: CreateHomepageBannerDto) {
  return homepageBannersControllerCreate(dto);
}
export function updateBanner(id: string, dto: Partial<CreateHomepageBannerDto>) {
  return homepageBannersControllerUpdate(id, dto);
}
export function deleteBanner(id: string) {
  return homepageBannersControllerRemove(id);
}
