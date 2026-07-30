'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LOCAL_HERO_SLIDE_COUNT, MINGO_HOME_ASSETS } from '@/config/mingo-home-content';
import type { HeroBannerView } from '@/features/home/types';

interface HeroCarouselProps {
  /** Banner active do GET /storefront/home trả về. */
  banners: HeroBannerView[];
  /** Chỉ bật khi endpoint homepage lỗi, không trộn campaign hard-code với dữ liệu API. */
  useLocalFallback: boolean;
}

/**
 * Link đích của nút "See Products" theo từng banner local.
 * Nút được render 1 lần ở cấp section nên vị trí luôn cố định; chỉ href đổi theo slide.
 */
const LOCAL_HERO_CTA_LINKS: readonly string[] = ['/products/creme-caramel', '/products', '/products'];

function BannerOne() {
  const assets = MINGO_HOME_ASSETS.bannerOne;

  return (
    <>
      <Image src={assets.background} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute left-[7%] top-[14%] z-10 w-[34%] max-w-[430px] sm:left-[11%] sm:top-[17%]">
        <Image src={assets.title} alt="" width={107} height={73} priority className="h-auto w-full" />
      </div>
      <div className="absolute -right-[17%] bottom-[4%] h-[76%] w-[88%] sm:-right-[4%] sm:bottom-[-3%] sm:h-[92%] sm:w-[72%] lg:right-[1%] lg:w-[66%]">
        <Image
          src={assets.products}
          alt="Các vị kem ly Mingo"
          fill
          priority
          sizes="(max-width: 640px) 88vw, 66vw"
          className="object-contain"
        />
      </div>
    </>
  );
}

function BannerTwo() {
  const assets = MINGO_HOME_ASSETS.bannerTwo;

  return (
    <>
      <Image src={assets.background} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute left-[6%] top-[8%] z-10 w-[27%] max-w-[260px] sm:left-[10%] sm:top-[11%]">
        <Image src={assets.badge} alt="" width={175} height={153} className="h-auto w-full" />
      </div>
      <div className="absolute left-[8%] top-[31%] z-10 w-[40%] max-w-[390px] sm:left-[13%] sm:top-[30%]">
        <Image src={assets.title} alt="" width={240} height={155} className="h-auto w-full" />
      </div>
      <div className="absolute bottom-[5%] left-[7%] z-10 hidden w-[25%] max-w-[250px] md:block">
        <Image src={assets.copy} alt="" width={313} height={379} className="h-auto w-full" />
      </div>
      <div className="absolute -right-[19%] bottom-[-7%] h-[94%] w-[88%] sm:-right-[7%] sm:h-[105%] sm:w-[72%] lg:right-[2%] lg:w-[58%]">
        <Image
          src={assets.product}
          alt="Kem dừa Fruitesia của Mingo"
          fill
          sizes="(max-width: 640px) 88vw, 58vw"
          className="object-contain"
        />
      </div>
    </>
  );
}

function BannerThree() {
  const assets = MINGO_HOME_ASSETS.bannerThree;

  return (
    <>
      <div className="absolute inset-0 -z-20 lg:-top-[88px] lg:h-[900px]">
        <Image
          src={assets.background}
          alt=""
          fill
          sizes="100vw"
          className="object-cover lg:object-fill"
        />
      </div>
      <div className="absolute left-1/2 top-8 z-10 w-[205px] -translate-x-1/2 sm:top-10 sm:w-[250px] lg:left-[32.15%] lg:top-[46px] lg:w-[270px] lg:translate-x-0">
        <Image src={assets.title} alt="" width={270} height={205} className="h-auto w-full" />
      </div>
      <div className="absolute -right-8 top-[145px] h-[420px] w-[200px] sm:right-[6%] sm:top-[155px] sm:h-[500px] sm:w-[236px] lg:-top-[46px] lg:left-[54.72%] lg:right-auto lg:h-[780px] lg:w-[368px]">
        <Image
          src={assets.product}
          alt="Kem que Crème Custard Caramel của Mingo"
          fill
          sizes="(max-width: 640px) 52vw, (max-width: 1024px) 38vw, 368px"
          className="object-contain drop-shadow-[0_18px_18px_rgba(82,45,17,0.12)]"
        />
      </div>
      <div className="absolute bottom-[86px] left-[6%] h-[160px] w-[190px] sm:left-[17%] sm:h-[200px] sm:w-[238px] lg:bottom-[116px] lg:left-[33.33%] lg:h-[312px] lg:w-[370px]">
        <Image
          src={assets.pudding}
          alt="Bánh flan caramel"
          fill
          sizes="(max-width: 640px) 48vw, 370px"
          className="object-contain"
        />
      </div>
    </>
  );
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

export function HeroCarousel({ banners, useLocalFallback }: HeroCarouselProps) {
  const t = useTranslations('home');
  const [slide, setSlide] = useState(0);
  const localSlideCount = useLocalFallback ? LOCAL_HERO_SLIDE_COUNT : 0;
  const slideCount = Math.max(1, localSlideCount + banners.length);
  const backendBanner = banners[slide - localSlideCount];
  const ctaHref = backendBanner?.linkUrl ?? (useLocalFallback ? LOCAL_HERO_CTA_LINKS[slide] : undefined);
  const ctaLabel = backendBanner?.ctaLabel ?? t('seeProduct');

  return (
    <section
      className="relative isolate h-[650px] overflow-hidden bg-secondary sm:h-[720px] lg:h-[816px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Sản phẩm nổi bật"
    >
      {useLocalFallback && slide === 0 && <BannerThree />}
      {useLocalFallback && slide === 1 && <BannerOne />}
      {useLocalFallback && slide === 2 && <BannerTwo />}
      {backendBanner && <BackendBanner banner={backendBanner} />}
      {!backendBanner && !useLocalFallback ? <div className="absolute inset-0 bg-secondary" /> : null}

      {ctaHref && (
        <Link
          href={ctaHref}
          className={
            useLocalFallback && slide === 0
              ? 'absolute bottom-[116px] left-[36.875%] z-20 inline-flex h-10 -translate-x-1/2 items-center rounded-full border-2 border-[#70381d] px-6 text-[14px] font-bold text-[#70381d] transition-colors hover:bg-[#70381d] hover:text-white'
              : 'absolute bottom-[12%] left-[9%] z-20 inline-flex h-11 items-center rounded-full border-2 border-white px-7 font-bold text-white transition-colors hover:bg-white hover:text-primary sm:left-[14%]'
          }
        >
          {ctaLabel}
        </Link>
      )}

      <button
        type="button"
        aria-label="Sản phẩm trước"
        onClick={() => setSlide((current) => (current - 1 + slideCount) % slideCount)}
        className="absolute left-4 top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/10 text-white transition-colors hover:bg-black/25 sm:left-8 lg:left-10 lg:top-[431px]"
      >
        <ChevronLeft className="size-8" strokeWidth={1.25} />
      </button>
      <button
        type="button"
        aria-label="Sản phẩm tiếp theo"
        onClick={() => setSlide((current) => (current + 1) % slideCount)}
        className="absolute right-4 top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/10 text-white transition-colors hover:bg-black/25 sm:right-8 lg:right-10 lg:top-[431px]"
      >
        <ChevronRight className="size-8" strokeWidth={1.25} />
      </button>

      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2 lg:hidden" aria-label="Chọn banner">
        {Array.from({ length: slideCount }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Banner ${index + 1}`}
            aria-current={index === slide ? 'true' : undefined}
            onClick={() => setSlide(index)}
            className={`h-2.5 rounded-full shadow-sm transition-all ${
              index === slide ? 'w-8 bg-white' : 'w-2.5 bg-white/55 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      <h1 className="sr-only">Kem Mingo — sản phẩm nổi bật</h1>
    </section>
  );
}
