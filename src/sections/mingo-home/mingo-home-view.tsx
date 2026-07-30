import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/types/localized';
import { getStorefrontHome } from '@/features/home/api';
import { getMockupBySlug, toMockupProductDto } from '@/features/product/mockup-catalog';
import { toProductCardView, type ProductCardView } from '@/features/product/types';
import { HeroCarousel } from './hero/hero-carousel';
import { MustTrySection } from './must-try/must-try-section';

export async function MingoHomeView({ locale }: { locale: Locale }) {
  const [homeResult, tHome] = await Promise.all([
    getStorefrontHome(locale).then(
      (home) => ({ home, failed: false as const }),
      () => ({
        home: { heroes: [], sections: [] },
        failed: true as const,
      }),
    ),
    getTranslations('home'),
  ]);

  const mustTrySections = homeResult.home.sections.filter(
    (section) => section.homepageSection === 'must_try',
  );
  const fallbackProducts = makeFallbackProducts(locale);

  return (
    <>
      {/* Fallback bật khi API lỗi HOẶC chưa có collection nào đặt placement=HERO —
          cả hai trường hợp API không đóng góp banner nào, nên không có gì để "trộn"
          với campaign local, và hiện banner thiết kế sẵn vẫn hơn một khung trống. */}
      <HeroCarousel
        banners={homeResult.home.heroes}
        useLocalFallback={homeResult.failed || homeResult.home.heroes.length === 0}
      />
      {mustTrySections.length > 0 ? (
        mustTrySections.map((section) => (
          <MustTrySection
            key={section.id}
            title={section.title}
            products={section.products}
          />
        ))
      ) : (
        <MustTrySection title={tHome('mustTry')} products={fallbackProducts} />
      )}
    </>
  );
}

function makeFallbackProducts(locale: Locale): ProductCardView[] {
  return ['creme-caramel', 'matcha-red-bean', 'creme-caramel', 'matcha-red-bean'].flatMap(
    (slug, index) => {
      const product = getMockupBySlug(slug);
      if (!product) return [];
      const card = toProductCardView(toMockupProductDto(product, locale), locale);
      return [{
        ...card,
        id: `${card.id}-${index}`,
        name: slug === 'creme-caramel' ? 'Creme Caramel' : 'Matcha Red Bean',
        spec: locale === 'vi' ? '100ml | 24 cây | thùng' : '100ml | 24 bars | carton',
      }];
    },
  );
}
