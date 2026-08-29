import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import type { ProductCardView } from './types';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { getTranslations } from 'next-intl/server';

export async function RelatedProducts({
  title,
  products,
}: {
  title: string;
  products: ProductCardView[];
}) {
  if (products.length === 0) return null;
  const t = await getTranslations('product');

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-20 sm:px-8 lg:pb-[140px] lg:pt-[145px] min-[1504px]:px-0">
      <h2 className="text-center text-[24px] font-bold leading-[60px] text-primary lg:text-[60px]">
        {title}
      </h2>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:mt-[172px] lg:grid-cols-4 lg:gap-x-6">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group min-w-0 text-[#563e2b]">
            <div className="relative aspect-[3/4] w-full">
              {product.image ? (
                <ProgressiveImage
                  src={product.image}
                  alt={product.name}
                  fill
                  loading="lazy"
                  quality={70}
                  sizes="(max-width: 1023px) 45vw, 282px"
                  className="object-contain transition-transform duration-300 group-hover:-translate-y-2"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-5xl">🍦</div>
              )}
            </div>
            <h3 className="mt-8 line-clamp-2 min-h-12 text-center font-sans text-[20px] font-bold leading-6 transition-colors group-hover:text-primary lg:mt-12 lg:min-h-[4.5rem] lg:text-[32px] lg:leading-9">
              {product.name}
            </h3>
            {!product.available ? (
              <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground lg:mt-5">{t('temporarilyOutOfStock')}</p>
            ) : product.priceOnRequest ? (
              <p className="mt-3 text-sm font-semibold leading-6 text-primary lg:mt-5">{t('contactForInfo')}</p>
            ) : (
              <div className="mt-3 flex items-baseline justify-between gap-2 text-[10px] font-light leading-6 lg:mt-5 lg:text-[14px]">
                {!product.specOutOfStock ? <span className="truncate">{product.spec ?? ''}</span> : <span />}
                {product.specOutOfStock ? (
                  <span className="shrink-0 font-semibold text-muted-foreground">{t('temporarilyOutOfStock')}</span>
                ) : (
                  <span className="shrink-0">{fCurrencyVND(product.price)}</span>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
