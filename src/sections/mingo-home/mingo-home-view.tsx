import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/types/localized';
import { getStorefrontHome } from '@/features/home/api';
import { HeroCarousel } from './hero/hero-carousel';
import { MustTrySection } from './must-try/must-try-section';
import { BrandShowcase } from '@/sections/brands/brand-showcase';

export async function MingoHomeView({ locale }: { locale: Locale }) {
  const [home, tProducts, tBrands] = await Promise.all([
    getStorefrontHome(locale).catch(() => ({ heroes: [], sections: [] })),
    getTranslations('products'),
    getTranslations('pages.brands'),
  ]);

  const { heroes, sections } = home;
  const viewAllLabel = tProducts('viewAll');

  return (
    <>
      {/* Banner cứng có sẵn luôn hiển thị; banner do admin tạo (nếu có) nối tiếp phía sau. */}
      <HeroCarousel banners={heroes} />
      <BrandShowcase
        eyebrow={tBrands('eyebrow')}
        title={tBrands('title')}
        joyTitle={tBrands('joy.title')}
        joyParagraphOne={tBrands('joy.paragraphOne')}
        joyParagraphTwo={tBrands.rich('joy.paragraphTwo', { b: (chunks) => <strong className="font-bold">{chunks}</strong> })}
        exploreCta={tBrands('joy.exploreCta')}
        aboutCta={tBrands('joy.aboutCta')}
        headingLevel="h2"
      />
      {/* Chỉ render collection lấy từ DB (/collections/homepage). Không dùng sản phẩm mock:
          khi backend chưa có collection nào thì không hiển thị section sản phẩm nào. */}
      {sections.map((section) => (
        <MustTrySection
          key={section.id}
          title={section.title}
          products={section.products}
          href={`/collections/${section.slug}`}
          viewAllLabel={viewAllLabel}
        />
      ))}
    </>
  );
}
