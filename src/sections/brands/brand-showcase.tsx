import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { fetchNavBrands, localNavBrands } from '@/features/catalog/nav-data';
import { ProgressiveImage } from '@/components/ui/progressive-image';

interface BrandShowcaseProps {
  /** Nhãn phụ phía trên tiêu đề (vd "our heritage"). */
  eyebrow: string;
  title: string;
  joyTitle: string;
  joyParagraphOne: string;
  /** Có tên brand in đậm nên nhận ReactNode (render qua t.rich với thẻ <b>). */
  joyParagraphTwo: ReactNode;
  exploreCta: string;
  aboutCta: string;
  headingLevel?: 'h1' | 'h2';
}

/** Nội dung thương hiệu dùng chung ở homepage và trang /brands. */
export async function BrandShowcase({
  eyebrow,
  title,
  joyTitle,
  joyParagraphOne,
  joyParagraphTwo,
  exploreCta,
  aboutCta,
  headingLevel = 'h1',
}: BrandShowcaseProps) {
  // Logo thương hiệu do admin upload (backend). Rỗng/lỗi -> fallback logo tĩnh trong config.
  const apiBrands = await fetchNavBrands().catch(() => []);
  const brands = apiBrands.length > 0 ? apiBrands : localNavBrands();
  const Heading = headingLevel;

  return (
    <div className="bg-ivory">
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <header className="flex flex-col items-center text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/80">
            {eyebrow}
          </span>
          <Heading className="mt-4 font-display text-4xl font-bold uppercase text-primary sm:text-5xl">
            {title}
          </Heading>
          <span className="mt-3 block h-1 w-24 rounded-full bg-primary sm:w-28" aria-hidden />
        </header>
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 items-center gap-x-8 gap-y-14 sm:grid-cols-3 sm:gap-x-12 lg:mt-20 lg:gap-y-24">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              aria-label={brand.name}
              className="relative mx-auto flex h-28 w-full max-w-[280px] items-center justify-center transition-transform hover:scale-105 sm:h-36 lg:h-44"
            >
              {brand.logoUrl ? (
                <ProgressiveImage
                  src={brand.logoUrl}
                  alt={brand.name}
                  fill
                  loading="lazy"
                  quality={70}
                  sizes="(max-width: 639px) calc(50vw - 36px), (max-width: 1023px) 30vw, 280px"
                  className="object-contain"
                />
              ) : (
                <span className="font-display text-4xl italic font-bold text-foreground sm:text-5xl">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-primary/15">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="font-display text-4xl font-extrabold uppercase leading-tight text-foreground sm:text-5xl">{joyTitle}</h2>
          <p className="mt-8 text-sm leading-7 text-foreground/85 sm:text-base">{joyParagraphOne}</p>
          <p className="mt-6 text-sm leading-7 text-foreground/85 sm:text-base">{joyParagraphTwo}</p>
          <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Button asChild size="lg" className="w-full rounded-lg bg-foreground text-white hover:bg-foreground/90 sm:w-auto">
              <Link href="/products">{exploreCta}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full rounded-lg sm:w-auto">
              <Link href="/about">{aboutCta}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
