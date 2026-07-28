import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/types/localized';
import { getStorefrontHome } from '@/features/home/api';
import { HeroCarousel } from './hero/hero-carousel';
import { MustTrySection } from './must-try/must-try-section';

export async function MingoHomeView({ locale }: { locale: Locale }) {
  const [homeResult, tProducts] = await Promise.all([
    getStorefrontHome(locale).then(
      (home) => ({ home, failed: false as const }),
      () => ({
        home: { heroes: [], sections: [] },
        failed: true as const,
      }),
    ),
    getTranslations('products'),
  ]);

  return (
    <>
      <HeroCarousel banners={homeResult.home.heroes} useLocalFallback={homeResult.failed} />
      {homeResult.home.sections
        .filter((section) => section.homepageSection === 'must_try')
        .map((section) => (
          <MustTrySection
            key={section.id}
            title={section.title}
            products={section.products}
            href={`/collections/${section.slug}`}
            viewAllLabel={tProducts('viewAll')}
          />
        ))}
    </>
  );
}
