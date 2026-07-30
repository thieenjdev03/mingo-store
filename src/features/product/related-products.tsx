import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import type { ProductCardView } from './types';

export function RelatedProducts({
  title,
  products,
}: {
  title: string;
  products: ProductCardView[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-20 sm:px-8 lg:pb-[140px] lg:pt-[145px] xl:px-0">
      <h2 className="text-center text-[24px] font-bold leading-[60px] text-primary lg:text-[60px]">
        {title}
      </h2>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:mt-[172px] lg:grid-cols-4 lg:gap-x-6">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group min-w-0 text-[#563e2b]">
            <div className="relative aspect-[3/4] w-full">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1023px) 45vw, 282px"
                  className="object-contain transition-transform duration-300 group-hover:-translate-y-2"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-5xl">🍦</div>
              )}
            </div>
            <h3 className="mt-8 truncate text-center text-[20px] font-bold leading-6 transition-colors group-hover:text-primary lg:mt-12 lg:text-[32px]">
              {product.name}
            </h3>
            <div className="mt-3 flex items-baseline justify-between gap-2 text-[10px] font-light leading-6 lg:mt-5 lg:text-[14px]">
              <span className="truncate">{product.spec ?? ''}</span>
              <span className="shrink-0">{fCurrencyVND(product.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
