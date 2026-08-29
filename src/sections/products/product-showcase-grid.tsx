import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import { ProgressiveImage } from '@/components/ui/progressive-image';

export interface ProductListCard {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  /** VND; 0 hoặc null -> ẩn giá */
  price: number | null;
  compareAtPrice?: number | null;
  stock?: number;
  available?: boolean;
  categoryName?: string | null;
  /** Nhãn quy cách đại diện (vd "100ml | 24 cây | thùng"). */
  spec?: string | null;
  specOutOfStock?: boolean;
  /** Bật "LH Báo Giá" => ẩn giá lẫn quy cách/biến thể, chỉ hiện nhãn liên hệ. */
  priceOnRequest?: boolean;
}

interface ProductShowcaseGridProps {
  products: ProductListCard[];
  outOfStockLabel: string;
  /** Nhãn thay cho cả hàng quy cách + giá khi sản phẩm ở chế độ liên hệ. */
  contactLabel: string;
}

/**
 * Lưới sản phẩm theo design: packshot đặt thẳng trên nền trang (không khung/viền),
 * tên bên dưới, và hàng "quy cách | giá" nhỏ màu xám.
 */
export function ProductShowcaseGrid({ products, outOfStockLabel, contactLabel }: ProductShowcaseGridProps) {
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-12 px-5 sm:gap-x-8 sm:gap-y-16 sm:px-8 lg:grid-cols-4 min-[1504px]:px-0">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group block text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <div className="relative mx-auto aspect-[3/5] w-full max-w-[220px] transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105">
            {product.image ? (
              <ProgressiveImage
                src={product.image}
                alt={product.name}
                fill
                loading="lazy"
                quality={70}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 220px"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">🍦</div>
            )}
          </div>

          {/* Giữ tên trong khối 2 dòng để hàng quy cách/giá luôn thẳng nhau. */}
          <h2 className="mt-5 line-clamp-2 min-h-[2.5em] font-display text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
            {product.name}
          </h2>

          {product.available === false ? (
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{outOfStockLabel}</p>
          ) : product.priceOnRequest ? (
            /* LH Báo Giá: chỉ còn nhãn liên hệ, không lộ quy cách/biến thể lẫn giá. */
            <p className="mt-2 text-sm font-semibold text-primary-dark">{contactLabel}</p>
          ) : product.spec || product.price ? (
            <div className="mt-2 flex items-baseline justify-between gap-3 text-xs text-muted-foreground sm:text-sm">
              {!product.specOutOfStock ? <span className="truncate">{product.spec ?? ''}</span> : <span />}
              {product.specOutOfStock ? (
                <span className="shrink-0 font-semibold text-muted-foreground">{outOfStockLabel}</span>
              ) : product.price ? (
                <span className="flex shrink-0 items-baseline gap-2">
                  {product.compareAtPrice ? <span className="line-through opacity-70">{fCurrencyVND(product.compareAtPrice)}</span> : null}
                  <span>{fCurrencyVND(product.price)}</span>
                </span>
              ) : null}
            </div>
          ) : null}

        </Link>
      ))}
    </div>
  );
}
