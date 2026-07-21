import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { ProductCardView } from '@/features/product/types';

export interface ProductCardProps {
  product: ProductCardView;
}

/** Card theo mockup: packshot + tên (không hiển thị giá ở card), hover scale nhẹ. */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group block text-center">
      <div className="relative mx-auto aspect-[3/5] w-full max-w-56 transition-transform duration-200 group-hover:scale-105">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain" sizes="(max-width: 768px) 50vw, 260px" />
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg bg-muted text-muted-foreground">🍦</div>
        )}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold">{product.name}</h3>
    </Link>
  );
}
