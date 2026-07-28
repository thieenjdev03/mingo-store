import type { StorefrontHomeDto } from '@/lib/api/generated/ecomAPI.schemas';
import { customFetch } from '@/lib/api/fetcher';
import type { Locale } from '@/types/localized';
import { toStorefrontHomeView, type StorefrontHomeView } from './types';

export async function getStorefrontHome(
  locale: Locale,
): Promise<StorefrontHomeView> {
  const response = await customFetch<StorefrontHomeDto>({
    url: '/storefront/home',
    method: 'GET',
    params: { locale },
    cache: 'no-store',
  });
  return toStorefrontHomeView(response, locale);
}
