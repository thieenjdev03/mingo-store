import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BrandShowcase } from '@/sections/brands/brand-showcase';
import { pageMetadata, SEO_COPY, toSeoLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = toSeoLocale(locale);
  return pageMetadata({ locale: seoLocale, pathname: '/brands', ...SEO_COPY[seoLocale].brands });
}

export default async function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.brands');

  return <BrandShowcase eyebrow={t('eyebrow')} title={t('title')} joyTitle={t('joy.title')} joyParagraphOne={t('joy.paragraphOne')} joyParagraphTwo={t.rich('joy.paragraphTwo', { b: (chunks) => <strong className="font-bold">{chunks}</strong> })} exploreCta={t('joy.exploreCta')} aboutCta={t('joy.aboutCta')} />;
}
