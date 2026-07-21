import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContentPage } from '@/components/layout/content-page';

export default async function PoliciesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.policies');
  return <ContentPage title={t('title')} intro={t('intro')} body={t('body')} cta={t('cta')} ctaHref="/contact" />;
}
