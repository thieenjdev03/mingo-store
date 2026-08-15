import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContentPage } from '@/components/layout/content-page';
import { pageMetadata, toSeoLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = toSeoLocale(locale);
  return pageMetadata({
    locale: seoLocale,
    pathname: '/faqs',
    title: seoLocale === 'vi' ? 'Câu hỏi thường gặp | Mingo Ice Cream' : 'Frequently asked questions | Mingo Ice Cream',
    description: seoLocale === 'vi' ? 'Giải đáp những câu hỏi thường gặp về sản phẩm, mua hàng và dịch vụ của Mingo Ice Cream.' : 'Find answers to common questions about Mingo Ice Cream products, ordering and service.',
  });
}

export default async function FaqsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.faqs');
  return <ContentPage title={t('title')} intro={t('intro')} body={t('body')} cta={t('cta')} ctaHref="/contact" />;
}
