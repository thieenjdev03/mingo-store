'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { HeroBannerView } from '@/features/home/types';
import { buildYouTubeEmbedUrl } from '@/lib/media/youtube';

interface HeroCarouselProps {
  /** Banner active từ backend (/homepage/banners), đã sort theo display_order. */
  banners: HeroBannerView[];
}

/** Tự động lướt sang banner kế tiếp sau mỗi khoảng thời gian này. */
const AUTOPLAY_INTERVAL_MS = 3000;

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
      {/* ponytail: từ lg các lớp đè đo bằng vw để co giãn cùng ảnh nền object-cover
          (nền scale theo chiều rộng ở tỉ lệ desktop thường gặp) — px cứng làm bố cục lệch
          khi zoom hoặc đổi độ phân giải. Muốn khớp tuyệt đối ở mọi tỉ lệ màn thì phải bọc
          cả cụm vào một stage aspect-ratio cố định. */}
      <div className="absolute left-1/2 top-[12%] z-10 w-[205px] -translate-x-1/2 sm:w-[250px] lg:left-[32.15%] lg:top-[15%] lg:w-[18.75vw] lg:translate-x-0">
        <Image src={PRIMARY_BANNER.title} alt="" width={270} height={205} loading="eager" fetchPriority="low" className="h-auto w-full" />
      </div>
      <div className="absolute -right-8 top-[24%] h-[52%] w-[200px] sm:right-[6%] sm:w-[236px] lg:left-[54.72%] lg:right-auto lg:top-[7%] lg:h-[82%] lg:w-[25.55vw]">
        <Image
          src={PRIMARY_BANNER.product}
          alt="Kem que Crème Custard Caramel của Mingo"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 52vw, (max-width: 1024px) 38vw, 26vw"
          className="object-contain drop-shadow-[0_18px_18px_rgba(82,45,17,0.12)]"
        />
      </div>
      <div className="absolute bottom-[10%] left-[6%] h-[160px] w-[190px] sm:left-[17%] sm:h-[200px] sm:w-[238px] lg:bottom-[12%] lg:left-[33.33%] lg:h-[21.67vw] lg:w-[25.7vw]">
        <Image
          src={PRIMARY_BANNER.pudding}
          alt="Bánh flan caramel"
          fill
          loading="eager"
          fetchPriority="low"
          sizes="(max-width: 640px) 48vw, 26vw"
          className="object-contain"
        />
      </div>
    </>
  );
}

function BackendBanner({ banner, onVideoEnded }: { banner: HeroBannerView; onVideoEnded?: () => void }) {
  // Link YouTube dùng iframe embed để autoplay không tiếng, ẩn controller/nút fullscreen/link ra ngoài.
  const youtubeEmbedUrl = banner.videoUrl ? buildYouTubeEmbedUrl(banner.videoUrl) : null;
  if (youtubeEmbedUrl) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/*
          Iframe YouTube không hỗ trợ object-fit: cover như <video> — phóng to theo tỉ lệ
          16:9 cố định (vw/vh) rồi crop bằng overflow-hidden của wrapper để lấp kín full-bleed
          thay vì bị viền đen (letterbox) theo khung hero không phải 16:9.
          pointer-events-none: banner chỉ trang trí nền, chặn hẳn tương tác/click ra YouTube.
        */}
        <iframe
          src={youtubeEmbedUrl}
          title={banner.alt || 'Mingo banner video'}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-[100dvh] w-[100vw] min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2 border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
        />
      </div>
    );
  }
  // MP4 tự phát nền (muted + playsInline để iOS/Chrome cho autoplay), không lặp khi
  // carousel có nhiều slide để chuyển sang slide kế tiếp khi phát xong.
  if (banner.videoUrl) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={banner.videoUrl}
        poster={banner.imageUrl || undefined}
        autoPlay
        muted
        controls={false}
        loop={!onVideoEnded}
        playsInline
        preload="metadata"
        aria-label={banner.alt || undefined}
        onEnded={onVideoEnded}
      />
    );
  }
  if (!banner.imageUrl) return null;
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

  // Có banner từ API -> dùng đúng banner đó, KHÔNG tự chèn ảnh mockup campaign nữa.
  // API rỗng (chưa cấu hình / lỗi tạm thời) -> fallback về mockup local để trang chủ
  // không bao giờ trống banner.
  const hasApiBanners = banners.length > 0;
  const slideCount = hasApiBanners ? banners.length : 1;
  // Phòng thủ khi banners đổi độ dài (SWR revalidate) mà slide index còn trỏ ra ngoài.
  const activeIndex = Math.min(slide, slideCount - 1);
  const isPrimaryBanner = !hasApiBanners;
  const banner = hasApiBanners ? banners[activeIndex] : undefined;
  const isVideoSlide = Boolean(banner?.videoUrl);

  const ctaHref = isPrimaryBanner ? PRIMARY_BANNER.href : banner?.linkUrl;
  const ctaLabel = banner?.ctaLabel ?? t('seeProduct');

  const advance = () => setSlide((current) => (current + 1) % slideCount);

  // Tự động lướt sang slide kế tiếp: ảnh sau AUTOPLAY_INTERVAL_MS cố định; video thì
  // đợi phát xong (onEnded ở BackendBanner gọi advance trực tiếp) thay vì cắt ngang bằng timer.
  useEffect(() => {
    if (slideCount <= 1 || isVideoSlide) return;
    const timer = setTimeout(advance, AUTOPLAY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [slideCount, activeIndex, isVideoSlide, advance]);

  return (
    <section
      // Banner chiếm trọn 100vh và kéo lên (-mt) đúng chiều cao header để nằm SAU
      // header trong suốt (header chỉ dùng ở homepage nên margin âm an toàn).
      className="relative isolate -mt-[64px] h-[100dvh] overflow-hidden bg-secondary xl:-mt-[84px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Sản phẩm nổi bật"
    >
      {isPrimaryBanner ? (
        <PrimaryBanner />
      ) : banner ? (
        // key=id -> remount hẳn node <video>/<picture> khi đổi slide, tránh việc chỉ đổi
        // src trên node cũ không tự autoplay lại ở một số trình duyệt.
        <BackendBanner key={banner.id} banner={banner} onVideoEnded={slideCount > 1 ? advance : undefined} />
      ) : null}

      {isVideoSlide ? (
        <div
          className="pointer-events-auto absolute inset-0 z-10 cursor-default bg-transparent"
          aria-hidden="true"
        />
      ) : null}

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
