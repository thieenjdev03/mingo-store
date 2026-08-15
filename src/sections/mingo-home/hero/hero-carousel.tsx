'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { HeroBannerView } from '@/features/home/types';

interface HeroCarouselProps {
  /** Banner active từ backend (/homepage/banners), đã sort theo display_order. */
  banners: HeroBannerView[];
}

const PRIMARY_BANNER = {
  background: '/assets/mingo/home/hero-background.jpg',
  title: '/assets/mingo/home/hero-title.svg',
  product: '/assets/mingo/home/hero-creme-product.png',
  pudding: '/assets/mingo/home/hero-pudding.png',
  href: '/products/creme-caramel',
} as const;

/** Banner campaign chính đi cùng storefront, luôn có mặt kể cả khi API tạm lỗi. */
function PrimaryBanner() {
  return (
    <>
      <Image
        src={PRIMARY_BANNER.background}
        alt=""
        fill
        priority
        fetchPriority="auto"
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute left-1/2 top-[12%] z-10 w-[205px] -translate-x-1/2 sm:w-[250px] lg:left-[32.15%] lg:top-[15%] lg:w-[270px] lg:translate-x-0">
        <Image src={PRIMARY_BANNER.title} alt="" width={270} height={205} loading="eager" fetchPriority="low" className="h-auto w-full" />
      </div>
      <div className="absolute -right-8 top-[24%] h-[52%] w-[200px] sm:right-[6%] sm:w-[236px] lg:left-[54.72%] lg:right-auto lg:top-[7%] lg:h-[82%] lg:w-[368px]">
        <Image
          src={PRIMARY_BANNER.product}
          alt="Kem que Crème Custard Caramel của Mingo"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 52vw, (max-width: 1024px) 38vw, 368px"
          className="object-contain drop-shadow-[0_18px_18px_rgba(82,45,17,0.12)]"
        />
      </div>
      <div className="absolute bottom-[10%] left-[6%] h-[160px] w-[190px] sm:left-[17%] sm:h-[200px] sm:w-[238px] lg:bottom-[12%] lg:left-[33.33%] lg:h-[312px] lg:w-[370px]">
        <Image
          src={PRIMARY_BANNER.pudding}
          alt="Bánh flan caramel"
          fill
          loading="eager"
          fetchPriority="low"
          sizes="(max-width: 640px) 48vw, 370px"
          className="object-contain"
        />
      </div>
    </>
  );
}

function BackendBanner({ banner }: { banner: HeroBannerView }) {
  // Có video -> tự phát nền (muted + playsInline để iOS/Chrome cho autoplay), lặp lại;
  // dùng ảnh làm poster để có khung hình ngay khi video chưa tải xong / thiết bị chặn autoplay.
  if (banner.videoUrl) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={banner.videoUrl}
        poster={banner.imageUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={banner.alt || undefined}
      />
    );
  }
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

  // Slide đầu luôn là campaign chính local; banner admin nối tiếp từ slide thứ hai.
  const slideCount = banners.length + 1;
  // Phòng thủ khi banners đổi độ dài (SWR revalidate) mà slide index còn trỏ ra ngoài.
  const activeIndex = Math.min(slide, slideCount - 1);
  const isPrimaryBanner = activeIndex === 0;
  const banner = isPrimaryBanner ? undefined : banners[activeIndex - 1];

  const ctaHref = isPrimaryBanner ? PRIMARY_BANNER.href : banner?.linkUrl;
  const ctaLabel = banner?.ctaLabel ?? t('seeProduct');

  return (
    <section
      // Banner chiếm trọn 100vh và kéo lên (-mt) đúng chiều cao header để nằm SAU
      // header trong suốt (header chỉ dùng ở homepage nên margin âm an toàn).
      className="relative isolate -mt-[64px] h-[100dvh] overflow-hidden bg-secondary xl:-mt-[84px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Sản phẩm nổi bật"
    >
      {isPrimaryBanner ? <PrimaryBanner /> : banner ? <BackendBanner banner={banner} /> : null}

      {ctaHref && (
        <Link
          href={ctaHref}
          className={
            isPrimaryBanner
              ? 'absolute bottom-[12%] left-1/2 z-20 inline-flex h-11 -translate-x-1/2 items-center rounded-full border-2 border-[#70381d] px-7 font-bold text-[#70381d] transition-colors hover:bg-[#70381d] hover:text-white lg:left-[36.875%]'
              : 'absolute bottom-[12%] left-[9%] z-20 inline-flex h-11 items-center rounded-full border-2 border-white px-7 font-bold text-white transition-colors hover:bg-white hover:text-primary sm:left-[14%]'
          }
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
