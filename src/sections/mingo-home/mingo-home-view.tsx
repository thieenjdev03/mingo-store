import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/types/localized';
import { getStorefrontHome } from '@/features/home/api';
import { getMockupBySlug, toMockupProductDto } from '@/features/product/mockup-catalog';
import { toProductCardView, type ProductCardView } from '@/features/product/types';
import { HeroCarousel } from './hero/hero-carousel';
import { MustTrySection } from './must-try/must-try-section';
import { BrandShowcase } from '@/sections/brands/brand-showcase';

export async function MingoHomeView({ locale }: { locale: Locale }) {
  const [home, tHome, tProducts, tBrands] = await Promise.all([
    getStorefrontHome(locale).catch(() => ({ heroes: [], sections: [] })),
    getTranslations('home'),
    getTranslations('products'),
    getTranslations('pages.brands'),
  ]);

  const { heroes, sections } = home;
  const viewAllLabel = tProducts('viewAll');
  const fallbackProducts = makeFallbackProducts(locale);

  return (
    <>
      {/* Banner cứng có sẵn luôn hiển thị; banner do admin tạo (nếu có) nối tiếp phía sau. */}
      <HeroCarousel banners={heroes} />
      {sections.length > 0 ? (
        sections.map((section) => (
          <MustTrySection
            key={section.id}
            title={section.title}
            products={section.products}
            href={`/collections/${section.slug}`}
            viewAllLabel={viewAllLabel}
          />
        ))
      ) : (
        <MustTrySection title={tHome('mustTry')} products={fallbackProducts} />
      )}
      <BrandShowcase
        eyebrow={tBrands('eyebrow')}
        title={tBrands('title')}
        joyTitle={tBrands('joy.title')}
        joyParagraphOne={tBrands('joy.paragraphOne')}
        joyParagraphTwo={tBrands.rich('joy.paragraphTwo', { b: (chunks) => <strong className="font-bold">{chunks}</strong> })}
        exploreCta={tBrands('joy.exploreCta')}
        aboutCta={tBrands('joy.aboutCta')}
      />
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
