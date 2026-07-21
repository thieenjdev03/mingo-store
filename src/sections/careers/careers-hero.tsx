import Image from 'next/image';
import { Search } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

export async function CareersHero({ query = '' }: { query?: string }) {
  const [t, locale] = await Promise.all([getTranslations('careers'), getLocale()]);
  const action = locale === 'vi' ? '/careers' : `/${locale}/careers`;

  return (
    <section className="relative isolate min-h-[360px] overflow-hidden bg-card sm:min-h-[410px]" aria-labelledby="careers-title">
      <div className="pointer-events-none absolute left-[29%] top-[-300px] -z-0 hidden size-[1120px] sm:block" aria-hidden="true">
        <Image src="/assets/mingo/home/mingo-logo.png" alt="" fill priority sizes="1120px" className="object-contain" />
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
