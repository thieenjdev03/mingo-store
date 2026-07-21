import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/features/contact/contact-form';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');

  return (
    <div className="bg-ivory">
      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-[76px] sm:px-8 sm:pb-24 sm:pt-[82px] lg:px-0 lg:pb-[82px] lg:pt-[78px]">
        <h1 className="mx-auto max-w-[950px] text-center font-display text-[42px] font-bold leading-[1.04] text-primary sm:text-[52px] lg:text-[60px]">
          {t('title')}
        </h1>
        <div className="mx-auto mt-[72px] max-w-[1226px]">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
