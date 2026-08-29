import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContentPage } from '@/components/layout/content-page';
import { getSiteSettings } from '@/features/site-settings/api';
import { pageMetadata, toSeoLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = toSeoLocale(locale);
  return pageMetadata({
    locale: seoLocale,
    pathname: '/partnership',
    title: seoLocale === 'vi' ? 'Hợp tác cùng Mingo Ice Cream — Phân phối và kinh doanh' : 'Partner with Mingo Ice Cream — Distribution and business',
    description: seoLocale === 'vi' ? 'Tìm hiểu cơ hội hợp tác kinh doanh, phân phối và phát triển thị trường cùng Mingo Ice Cream.' : 'Discover business, distribution and market development opportunities with Mingo Ice Cream.',
  });
}

export default async function PartnershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.partnership');
  // Link do admin cấu hình ở /admin/settings.
  const { partnership_pdf_url: pdfUrl } = await getSiteSettings();

  return (
    <ContentPage
      title={t('title')}
      intro={t('intro')}
      body={t('body')}
      cta={t('cta')}
      // Nút "Liên hệ đội ngũ" mở hồ sơ PDF của khách; chưa cấu hình thì về trang liên hệ.
      ctaHref={pdfUrl ?? '/contact'}
    />
  );
}
