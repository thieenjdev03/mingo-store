import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BrandShowcase } from '@/sections/brands/brand-showcase';

export default async function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.brands');

  return <BrandShowcase eyebrow={t('eyebrow')} title={t('title')} joyTitle={t('joy.title')} joyParagraphOne={t('joy.paragraphOne')} joyParagraphTwo={t('joy.paragraphTwo')} exploreCta={t('joy.exploreCta')} aboutCta={t('joy.aboutCta')} />;
}
