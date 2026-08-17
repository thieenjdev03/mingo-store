import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import { ProgressiveImage } from '@/components/ui/progressive-image';

export interface CategoryProductCard {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  /** VND; 0/null -> ẩn giá */
  price: number | null;
  compareAtPrice?: number | null;
  available?: boolean;
  /** Quy cách đóng gói, vd "100ml | 24 cây | thùng" */
  spec: string | null;
}

/**
 * Lưới sản phẩm trang danh mục theo mockup: packshot lớn "thả nổi" trên nền trung tính,
 * bên dưới là tên + dòng "quy cách | giá". Không viền/nền card.
 */
export function CategoryProductGrid({ products }: { products: CategoryProductCard[] }) {
  return (
    <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-8 gap-y-12 px-5 sm:px-8 lg:grid-cols-4 lg:gap-x-10 min-[1320px]:px-0">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.slug}`} className="group block">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px]">
            {product.image ? (
              <ProgressiveImage
                src={product.image}
                alt={product.name}
                fill
                loading="lazy"
                quality={70}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 280px"
                className="object-contain transition-transform duration-300 motion-reduce:transition-none group-hover:-translate-y-2 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">🍦</div>
            )}
          </div>

          <h2 className="mt-6 line-clamp-2 min-h-[2.5em] font-sans text-[26px] font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
            {product.name}
          </h2>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="min-w-0 truncate">{product.spec ?? ''}</span>
            {product.price ? <span className="shrink-0 font-medium">{fCurrencyVND(product.price)}</span> : null}
          </div>
          {product.compareAtPrice ? <p className="mt-1 text-right text-xs text-muted-foreground line-through">{fCurrencyVND(product.compareAtPrice)}</p> : null}
        </Link>
      ))}
    </div>
  );
}
