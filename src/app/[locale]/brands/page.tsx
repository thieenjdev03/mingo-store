import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { BRANDS } from '@/config/brands';

export default async function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.brands');

  return (
    <div className="bg-ivory">
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <h1 className="text-center font-display text-4xl font-bold uppercase text-primary sm:text-5xl">
          <span className="border-b-4 border-primary pb-2">{t('title')}</span>
        </h1>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 items-center gap-x-8 gap-y-14 sm:grid-cols-3 sm:gap-x-12 lg:mt-20 lg:gap-y-24">
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              aria-label={brand.name}
              className="relative mx-auto flex h-28 w-full max-w-[280px] items-center justify-center transition-transform hover:scale-105 sm:h-36 lg:h-44"
            >
              {brand.logo ? (
                <Image src={brand.logo} alt={brand.name} fill sizes="(max-width: 640px) 45vw, 280px" className="object-contain" />
              ) : (
                <span className="font-display text-4xl italic font-bold text-foreground sm:text-5xl">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-primary/15 bg-butter">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:py-20">
          <h2 className="font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">{t('joy.title')}</h2>
          <p className="mt-6 text-sm leading-7 text-foreground/85 sm:text-base">{t('joy.paragraphOne')}</p>
          <p className="mt-6 text-sm leading-7 text-foreground/85 sm:text-base">{t('joy.paragraphTwo')}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/products">{t('joy.exploreCta')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">{t('joy.aboutCta')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
