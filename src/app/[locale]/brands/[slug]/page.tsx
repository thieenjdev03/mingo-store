import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContentPage } from '@/components/layout/content-page';

function titleFromSlug(slug: string) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export default async function BrandPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.brands');
  return <ContentPage eyebrow={t('title')} title={titleFromSlug(slug)} intro={t('intro')} body={t('body')} cta={t('cta')} ctaHref="/products" />;
}
