import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { ShowcaseProduct } from '@/config/mingo-home-content';

export function ProductShowcaseGrid({ products }: { products: ShowcaseProduct[] }) {
  return (
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-x-6 gap-y-14 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-0">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.slug}`} className="group block text-center">
          <div className="relative h-[376px] w-full">
            <Image
              src={product.imageUrl}
              alt={product.imageAlt}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 282px"
              className="object-contain transition-transform duration-300 motion-reduce:transition-none group-hover:-translate-y-2 group-hover:scale-[1.02]"
            />
          </div>
          <h2 className="mt-12 text-[26px] font-semibold leading-7 text-foreground transition-colors group-hover:text-primary lg:text-[32px] lg:leading-6">
            {product.name}
          </h2>
        </Link>
      ))}
    </div>
  );
}
