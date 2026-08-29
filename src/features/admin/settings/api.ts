/** Data-layer admin cho các link cấu hình storefront (`/settings`). */
import { customFetch } from '@/lib/api/fetcher';
import type { SiteSettings } from '@/features/site-settings/api';

export const siteSettingsKey = '/settings';

export function getSiteSettings() {
  return customFetch<SiteSettings>({ url: siteSettingsKey, method: 'GET', cache: 'no-store' });
}

/** Chuỗi rỗng = xoá link. Backend chỉ nhận http/https. */
export function updateSiteSettings(dto: Partial<Record<keyof SiteSettings, string>>) {
  return customFetch<SiteSettings>({ url: siteSettingsKey, method: 'PATCH', data: dto });
}
