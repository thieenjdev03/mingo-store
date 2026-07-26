import type { ProductCardView } from '@/features/product/types';
import { Link } from '@/i18n/navigation';
import { ProductCarousel } from './product-carousel';

interface CollectionShowcaseProps {
  title: string;
  products: ProductCardView[];
  /** Link "xem tất cả" (vd sang trang collection). Bỏ trống -> ẩn. */
  href?: string;
  viewAllLabel?: string;
}

/**
 * Section sản phẩm theo collection ở trang chủ (tiêu đề = tên collection do admin đặt).
 * Nhiều section có thể xếp chồng nên KHÔNG dùng chiều cao cố định.
 */
export function MustTrySection({ title, products, href, viewAllLabel }: CollectionShowcaseProps) {
  if (products.length === 0) return null;

  return (
    <section className="bg-background py-[56px] sm:py-[72px] lg:py-[88px]">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 min-[1264px]:px-0">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 lg:mb-14">
          <h2 className="text-[40px] font-bold leading-none text-primary sm:text-[48px] lg:text-[56px]">{title}</h2>
          {href && viewAllLabel ? (
            <Link href={href} className="text-sm font-bold uppercase tracking-wide text-foreground hover:text-primary">
              {viewAllLabel}
            </Link>
          ) : null}
        </div>
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
