import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';

export interface ProductListCard {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  /** VND; 0 hoặc null -> ẩn giá */
  price: number | null;
  categoryName?: string | null;
  isMockup?: boolean;
}

/**
 * Lưới sản phẩm: packshot trên nền kem bo tròn, tên + danh mục + giá bên dưới.
 * Sản phẩm mockup gắn nhãn góc "Mockup" để phân biệt với dữ liệu thật (backend chưa seed).
 */
export function ProductShowcaseGrid({ products }: { products: ProductListCard[] }) {
  return (
    <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-5 gap-y-8 px-5 sm:gap-x-6 sm:gap-y-10 sm:px-8 lg:grid-cols-4 min-[1264px]:px-0">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <div className="relative aspect-square w-full overflow-hidden bg-ivory">
            {product.isMockup ? (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-foreground/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Mockup
              </span>
            ) : null}
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 260px"
                className="object-contain p-5 transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">🍦</div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-1 px-4 py-4 sm:px-5">
            {product.categoryName ? (
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {product.categoryName}
              </span>
            ) : null}
            <h2 className="text-lg font-bold leading-6 text-foreground transition-colors group-hover:text-primary sm:text-xl">
              {product.name}
            </h2>
            {product.price ? (
              <p className="mt-auto pt-2 text-lg font-bold text-primary">{fCurrencyVND(product.price)}</p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
