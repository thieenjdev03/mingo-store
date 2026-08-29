import type { ProductCardView } from '@/features/product/types';
import { Link } from '@/i18n/navigation';
import { ProductCarousel } from './product-carousel';

interface CollectionShowcaseProps {
  title: string;
  products: ProductCardView[];
  description?: string | null;
  /** Link "xem tất cả" (vd sang trang collection). Bỏ trống -> ẩn nút. */
  bgColor?: 'ivory' | 'white';
  href?: string;
  viewAllLabel?: string;
  /** Canh tiêu đề (mặc định 'left'). 'center' căn giữa cả section (dùng ở khối gợi ý PDP). */
  titleAlign?: 'left' | 'center' | 'right';
}

const TITLE_ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

/**
 * Section sản phẩm theo collection ở trang chủ (tiêu đề = tên collection do admin đặt).
 * Nhiều section có thể xếp chồng nên KHÔNG dùng chiều cao cố định.
 */
export function MustTrySection({ title, products, description, href, viewAllLabel, titleAlign = 'left' }: CollectionShowcaseProps) {
  if (products.length === 0) return null;

  // Chỉ hiện nút "xem tất cả" khi có đủ href + label.
  const showViewAll = Boolean(href && viewAllLabel);
  const alignClass = TITLE_ALIGN_CLASS[titleAlign];

  return (
    <section className={`relative py-10 sm:py-14 lg:py-[60px] ${titleAlign === 'center' ? 'bg-white' : titleAlign === 'right' ? 'bg-ivory' : ''}` }>
      {/* Bỏ padding đúng lúc mũi tên carousel ra được ngoài khung (min-[1360px]) — dưới mốc đó giữ padding để nội dung không chạm mép. */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 min-[1504px]:px-0">
        <div className="mb-10 lg:mb-[60px]">
          <div className="flex flex-wrap items-end gap-4">
            {/* flex-1 để h2 chiếm hết chỗ trống -> text-align mới thực sự canh được trong section. */}
            <h2 className={`flex-1 text-[40px] font-bold leading-none text-primary sm:text-[48px] lg:text-[60px] ${alignClass}`}>
              {title}
            </h2>
            {showViewAll ? (
              <Link href={href!} className="shrink-0 text-sm font-bold uppercase tracking-wide text-foreground hover:text-primary">
                {viewAllLabel}
              </Link>
            ) : null}
          </div>
          {description ? (
            <p className={`mt-4 max-w-2xl text-sm leading-7 text-foreground/70 sm:text-base ${
              titleAlign === 'center' ? 'mx-auto text-center' : titleAlign === 'right' ? 'ml-auto text-right' : ''
            }`}>
              {description}
            </p>
          ) : null}
        </div>
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
