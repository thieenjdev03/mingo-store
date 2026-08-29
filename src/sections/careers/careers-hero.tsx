import { Search } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { CareersBannerMark } from './careers-banner-mark';

export async function CareersHero({ query = '' }: { query?: string }) {
  const [t, locale] = await Promise.all([getTranslations('careers'), getLocale()]);
  const action = locale === 'vi' ? '/careers' : `/${locale}/careers`;

  return (
    <section className="relative isolate min-h-[320px] overflow-hidden bg-card sm:min-h-[410px] lg:min-h-[468px]" aria-labelledby="careers-title">
      <CareersBannerMark />
      <div className="relative z-10 mx-auto flex min-h-[320px] max-w-[1440px] items-center px-5 sm:min-h-[410px] sm:px-8 lg:min-h-[468px]">
        <div className="w-full max-w-[390px] lg:max-w-[370px]">
          <h1 id="careers-title" className="font-display text-3xl font-bold uppercase text-primary sm:text-4xl lg:text-[40px]">{t('hero.title')}</h1>
          <form action={action} method="get" className="mt-9 flex h-12 w-full items-center rounded-full bg-muted lg:h-14">
            <label htmlFor="job-search" className="sr-only">{t('hero.searchLabel')}</label>
            <input id="job-search" name="q" defaultValue={query} placeholder={t('hero.placeholder')} className="min-w-0 flex-1 bg-transparent px-5 text-sm text-foreground outline-none placeholder:text-muted-foreground/55 lg:text-base" />
            <button type="submit" aria-label={t('hero.search')} className="mr-0.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-muted-foreground text-white transition-colors hover:bg-primary lg:size-[54px]">
              <Search className="size-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
