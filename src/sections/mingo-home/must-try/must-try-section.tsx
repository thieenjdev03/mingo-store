import { getTranslations } from 'next-intl/server';
import { MUST_TRY_PRODUCTS } from '@/config/mingo-home-content';
import { ProductCarousel } from './product-carousel';

export async function MustTrySection() {
  const t = await getTranslations('home');

  return (
    <section className="bg-background py-[72px] sm:py-[90px] lg:h-[808px] lg:py-[100px]">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 min-[1264px]:px-0">
        <h2 className="mb-[58px] text-[44px] font-bold leading-none text-primary sm:text-[52px] lg:mb-[100px] lg:text-[60px]">
          {t('mustTry')}
        </h2>
        <ProductCarousel products={MUST_TRY_PRODUCTS} />
      </div>
    </section>
  );
}
