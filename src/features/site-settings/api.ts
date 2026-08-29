/**
 * Các link rời do admin cấu hình (GET /settings). Endpoint có sau lần `api:gen` gần nhất
 * nên type được khai báo tay ở đây, giống cách features/home dùng customFetch.
 */
import { customFetch } from '@/lib/api/fetcher';

export interface SiteSettings {
  /** Link PDF hồ sơ hợp tác khách cung cấp; null = chưa cấu hình. */
  partnership_pdf_url: string | null;
}

const EMPTY: SiteSettings = { partnership_pdf_url: null };

/** Backend chết thì trang vẫn render với hành vi mặc định, không nổ 500. */
export async function getSiteSettings(): Promise<SiteSettings> {
  return customFetch<SiteSettings>({
    url: '/settings',
    method: 'GET',
    next: { revalidate: 300 },
  }).catch(() => EMPTY);
}
