import Image from 'next/image';
import { Search } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

export async function CareersHero({ query = '' }: { query?: string }) {
  const [t, locale] = await Promise.all([getTranslations('careers'), getLocale()]);
  const action = locale === 'vi' ? '/careers' : `/${locale}/careers`;

  return (
    <section className="relative isolate min-h-[360px] overflow-hidden bg-card sm:min-h-[410px]" aria-labelledby="careers-title">
      {/* Logo full chiều cao banner, dính mép phải. object-right giữ logo bám cạnh phải
          khi banner rộng ra; ẩn dưới sm để không đè lên form tìm kiếm. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-0 hidden w-1/2 sm:block" aria-hidden="true">
        <Image
          src="/assets/mingo/m-stroke-orange.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-contain object-right"
        />
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
