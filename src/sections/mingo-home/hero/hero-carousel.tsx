'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { HeroBannerView } from '@/features/home/types';

interface HeroCarouselProps {
  /** Banner active từ backend (/homepage/banners), đã sort theo display_order. */
  banners: HeroBannerView[];
}

function BackendBanner({ banner }: { banner: HeroBannerView }) {
  return (
    <picture className="absolute inset-0">
      {banner.mobileImageUrl ? <source media="(max-width: 639px)" srcSet={banner.mobileImageUrl} /> : null}
      {/* URL ảnh do CMS quản lý, dùng picture để hỗ trợ desktop/mobile khác nhau. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={banner.imageUrl} alt={banner.alt} className="h-full w-full object-cover" />
    </picture>
  );
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const t = useTranslations('home');
  const [slide, setSlide] = useState(0);

  // Không có banner nào từ backend => không render carousel.
  if (banners.length === 0) return null;

  const slideCount = banners.length;
  // Phòng thủ khi banners đổi độ dài (SWR revalidate) mà slide index còn trỏ ra ngoài.
  const activeIndex = Math.min(slide, slideCount - 1);
  const banner = banners[activeIndex];
  if (!banner) return null;

  const ctaHref = banner.linkUrl;
  const ctaLabel = banner.ctaLabel ?? t('seeProduct');

  return (
    <section
      // Banner chiếm trọn 100vh và kéo lên (-mt) đúng chiều cao header để nằm SAU
      // header trong suốt (header chỉ dùng ở homepage nên margin âm an toàn).
      className="relative isolate -mt-[64px] h-[100dvh] overflow-hidden bg-secondary xl:-mt-[84px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Sản phẩm nổi bật"
    >
      <BackendBanner banner={banner} />

      {ctaHref && (
        <Link
          href={ctaHref}
          className="absolute bottom-[12%] left-[9%] z-20 inline-flex h-11 items-center rounded-full border-2 border-white px-7 font-bold text-white transition-colors hover:bg-white hover:text-primary sm:left-[14%]"
        >
          {ctaLabel}
        </Link>
      )}

      {slideCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Sản phẩm trước"
            onClick={() => setSlide((current) => (current - 1 + slideCount) % slideCount)}
            className="absolute left-4 top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/10 text-white transition-colors hover:bg-black/25 sm:left-8 lg:left-10"
          >
            <ChevronLeft className="size-8" strokeWidth={1.25} />
          </button>
          <button
            type="button"
            aria-label="Sản phẩm tiếp theo"
            onClick={() => setSlide((current) => (current + 1) % slideCount)}
            className="absolute right-4 top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/10 text-white transition-colors hover:bg-black/25 sm:right-8 lg:right-10"
          >
            <ChevronRight className="size-8" strokeWidth={1.25} />
          </button>

          <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2 lg:hidden" aria-label="Chọn banner">
            {Array.from({ length: slideCount }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Banner ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setSlide(index)}
                className={`h-2.5 rounded-full shadow-sm transition-all ${
                  index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/55 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}

      <h1 className="sr-only">Kem Mingo — sản phẩm nổi bật</h1>
    </section>
  );
}
