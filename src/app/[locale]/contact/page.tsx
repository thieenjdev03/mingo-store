import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/features/contact/contact-form';
import { pageMetadata, SEO_COPY, toSeoLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = toSeoLocale(locale);
  return pageMetadata({ locale: seoLocale, pathname: '/contact', ...SEO_COPY[seoLocale].contact });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');

  return (
    <div className="bg-ivory">
      <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-[82px] min-[1504px]:px-0 lg:pb-[82px] lg:pt-[78px]">
        <h1 className="mx-auto max-w-[950px] text-center font-display text-[34px] font-bold leading-[1.08] text-primary sm:text-[52px] sm:leading-[1.04] lg:text-[60px]">
          {t('title')}
        </h1>
        <div className="mx-auto mt-10 max-w-[1226px] sm:mt-[72px]">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
