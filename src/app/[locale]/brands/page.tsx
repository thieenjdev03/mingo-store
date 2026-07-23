import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BRANDS } from '@/config/brands';

export default async function BrandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.brands');
  const brands = BRANDS.filter((brand) => brand.logo !== null);

  return (
    <div className="bg-ivory">
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <h1 className="text-center font-display text-4xl font-bold uppercase text-primary sm:text-5xl">{t('title')}</h1>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 items-center gap-x-8 gap-y-14 sm:grid-cols-3 sm:gap-x-12 lg:mt-20 lg:gap-y-24">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              aria-label={brand.name}
              className="relative mx-auto block h-28 w-full max-w-[280px] transition-transform hover:scale-105 sm:h-36 lg:h-44"
            >
              <Image src={brand.logo!} alt={brand.name} fill sizes="(max-width: 640px) 45vw, 280px" className="object-contain" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
