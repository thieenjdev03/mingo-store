'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HERO_BANNERS, MINGO_HOME_ASSETS } from '@/config/mingo-home-content';

const SLIDE_COUNT = 1 + HERO_BANNERS.length; // slide 0 = composition, còn lại = banner

export function HeroCarousel() {
  const t = useTranslations('home');
  const [slide, setSlide] = useState(0);
  const banner = slide > 0 ? HERO_BANNERS[slide - 1] : undefined;

  return (
    <section
      className="relative isolate h-[650px] overflow-hidden bg-secondary sm:h-[720px] lg:h-[800px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Sản phẩm nổi bật"
    >
      {banner ? (
        <div className="absolute inset-0">
          <Image src={banner.src} alt={banner.alt} fill sizes="100vw" className="object-cover" />
        </div>
      ) : (
        <>
      <div className="absolute inset-0 -z-20 lg:-top-[100px] lg:h-[900px]">
        <Image
          src={MINGO_HOME_ASSETS.heroBackground}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover lg:object-fill"
        />
      </div>

      <div className="absolute left-1/2 top-8 z-10 w-[205px] -translate-x-1/2 sm:top-10 sm:w-[250px] lg:left-[32.15%] lg:top-[46px] lg:w-[270px] lg:translate-x-0">
        <Image
          src={MINGO_HOME_ASSETS.heroTitle}
          alt=""
          width={270}
          height={205}
          priority
          className="h-auto w-full"
        />
      </div>

      <div className="absolute -right-8 top-[145px] h-[420px] w-[200px] sm:right-[6%] sm:top-[155px] sm:h-[500px] sm:w-[236px] lg:-top-[46px] lg:left-[54.72%] lg:right-auto lg:h-[780px] lg:w-[368px]">
        <Image
          src={MINGO_HOME_ASSETS.heroProduct}
          alt="Kem que Crème Custard Caramel của Mingo"
          fill
          priority
          sizes="(max-width: 640px) 52vw, (max-width: 1024px) 38vw, 368px"
          className="object-contain drop-shadow-[0_18px_18px_rgba(82,45,17,0.12)]"
        />
      </div>

      <div className="absolute bottom-[86px] left-[6%] h-[160px] w-[190px] sm:bottom-[86px] sm:left-[17%] sm:h-[200px] sm:w-[238px] lg:bottom-[116px] lg:left-[33.33%] lg:h-[312px] lg:w-[370px]">
        <Image
          src={MINGO_HOME_ASSETS.heroPudding}
          alt="Bánh flan caramel"
          fill
          sizes="(max-width: 640px) 48vw, 370px"
          className="object-contain"
        />
      </div>

      <Link
        href="/products/creme-caramel"
        className="absolute bottom-[38px] left-1/2 z-20 inline-flex h-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-foreground bg-cream px-6 text-[16px] font-bold text-foreground transition-colors hover:bg-foreground hover:text-white focus-visible:outline-offset-4 sm:bottom-[46px] lg:bottom-[116px] lg:left-[42.66%] lg:h-10 lg:text-[20px]"
      >
        {t('seeProduct')}
      </Link>
        </>
      )}

      <button
        type="button"
        aria-label="Sản phẩm trước"
        onClick={() => setSlide((s) => (s - 1 + SLIDE_COUNT) % SLIDE_COUNT)}
        className="absolute left-4 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white/70 transition-colors hover:bg-black/15 hover:text-white sm:left-8 lg:left-10 lg:top-[51.875%]"
      >
        <ChevronLeft className="size-8" strokeWidth={1.25} />
      </button>
      <button
        type="button"
        aria-label="Sản phẩm tiếp theo"
        onClick={() => setSlide((s) => (s + 1) % SLIDE_COUNT)}
        className="absolute right-4 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white/70 transition-colors hover:bg-black/15 hover:text-white sm:right-8 lg:right-10 lg:top-[51.875%]"
      >
        <ChevronRight className="size-8" strokeWidth={1.25} />
      </button>

      <h1 className="sr-only">Kem Crème Custard Caramel mới từ Mingo</h1>
    </section>
  );
}
