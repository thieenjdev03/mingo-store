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
      {/* Fallback bật khi API lỗi HOẶC chưa có collection nào đặt placement=HERO —
          cả hai trường hợp API không đóng góp banner nào, nên không có gì để "trộn"
          với campaign local, và hiện banner thiết kế sẵn vẫn hơn một khung trống. */}
      <HeroCarousel
        banners={homeResult.home.heroes}
        useLocalFallback={homeResult.failed || homeResult.home.heroes.length === 0}
      />
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
