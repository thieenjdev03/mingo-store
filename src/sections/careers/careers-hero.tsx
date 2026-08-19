import Image from 'next/image';
import { Search } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

// TODO: thay bằng banner Figma thật khi có asset/URL được cung cấp.
const CAREERS_BANNER_URL = '/assets/mingo/home/hero-background.jpg';

export async function CareersHero({ query = '' }: { query?: string }) {
  const [t, locale] = await Promise.all([getTranslations('careers'), getLocale()]);
  const action = locale === 'vi' ? '/careers' : `/${locale}/careers`;

  return (
    <section className="relative isolate min-h-[360px] overflow-hidden bg-primary-dark sm:min-h-[410px]" aria-labelledby="careers-title">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <Image
          src={CAREERS_BANNER_URL}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-card/30" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[360px] max-w-[1200px] items-center px-5 sm:min-h-[410px] sm:px-8">
        <div className="w-full max-w-[390px]">
          <h1 id="careers-title" className="font-display text-3xl font-bold uppercase text-primary sm:text-4xl">{t('hero.title')}</h1>
          <form action={action} method="get" className="mt-9 flex h-12 w-full items-center rounded-full bg-muted">
            <label htmlFor="job-search" className="sr-only">{t('hero.searchLabel')}</label>
            <input id="job-search" name="q" defaultValue={query} placeholder={t('hero.placeholder')} className="min-w-0 flex-1 bg-transparent px-5 text-sm text-foreground outline-none placeholder:text-muted-foreground/55" />
            <button type="submit" aria-label={t('hero.search')} className="mr-0.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-muted-foreground text-white transition-colors hover:bg-primary">
              <Search className="size-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
