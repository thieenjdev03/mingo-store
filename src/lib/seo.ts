import type { Metadata } from 'next';

/**
 * Domain canonical duy nhất của storefront. Mọi URL tuyệt đối (canonical, og:url,
 * sitemap, JSON-LD) phải đi qua đây — không hardcode domain ở bất kỳ file nào khác.
 * Fallback là domain thương hiệu, KHÔNG phải alias *.vercel.app, để bản build thiếu
 * env vẫn không tự khai mình là bản sao của domain vercel.
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://mingocream.hongtanphat.com',
);

/** Domain production thật — dùng để robots.ts chặn index trên preview/alias. */
export const PRODUCTION_ORIGIN = 'https://mingocream.hongtanphat.com';

export const IS_PRODUCTION_HOST = SITE_URL.origin === PRODUCTION_ORIGIN;

export const SITE_NAME = 'Mingo Ice Cream';
export const DEFAULT_OG_IMAGE = '/assets/mingo/home/hero-background.jpg';
export const NO_INDEX_METADATA: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export type SeoLocale = 'vi' | 'en';

export function toSeoLocale(locale: string): SeoLocale {
  return locale === 'en' ? 'en' : 'vi';
}

export function localizedPath(locale: string, pathname = '/'): string {
  const normalized = pathname === '/' ? '' : `/${pathname.replace(/^\/+|\/+$/g, '')}`;
  return locale === 'en' ? `/en${normalized || ''}` : normalized || '/';
}

export function absoluteUrl(pathname = '/'): string {
  return new URL(pathname, SITE_URL).toString();
}

export function stripHtml(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function seoDescription(value: string | null | undefined, fallback: string): string {
  const text = stripHtml(value) || fallback;
  return text.length <= 160 ? text : `${text.slice(0, 157).trimEnd()}…`;
}

interface PageMetadataInput {
  locale: string;
  pathname?: string;
  title: string;
  description: string;
  image?: string | null;
  type?: 'website' | 'article';
}

export function pageMetadata({
  locale,
  pathname = '/',
  title,
  description,
  image,
  type = 'website',
}: PageMetadataInput): Metadata {
  const currentLocale = toSeoLocale(locale);
  const canonicalPath = localizedPath(currentLocale, pathname);
  const viPath = localizedPath('vi', pathname);
  const enPath = localizedPath('en', pathname);
  const socialImage = image || DEFAULT_OG_IMAGE;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        'vi-VN': viPath,
        'en-US': enPath,
        'x-default': viPath,
      },
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: currentLocale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: currentLocale === 'vi' ? ['en_US'] : ['vi_VN'],
      url: canonicalPath,
      title,
      description,
      images: [{ url: socialImage, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
  };
}

export const SEO_COPY = {
  vi: {
    home: {
      title: 'Mingo Ice Cream Việt Nam — Kem que, kem hộp và kem ốc quế',
      description: 'Khám phá kem Mingo tại Việt Nam: kem que, kem hộp, kem ốc quế và nhiều hương vị mát lạnh cho mọi khoảnh khắc.',
    },
    products: {
      title: 'Sản phẩm kem Mingo — Kem que, kem hộp và kem ly',
      description: 'Khám phá danh mục sản phẩm kem Mingo gồm kem que, kem hộp, kem ly, kem ốc quế và các bộ sưu tập hương vị nổi bật.',
    },
    brands: {
      title: 'Thương hiệu kem Mingo — Khám phá các dòng sản phẩm',
      description: 'Khám phá các thương hiệu và dòng kem thuộc Mingo Ice Cream, từ hương vị trái cây đến kem sữa và món tráng miệng.',
    },
    about: {
      title: 'Về Mingo Ice Cream — Lịch sử, thương hiệu và hệ thống phân phối',
      description: 'Tìm hiểu hành trình Mingo Ice Cream từ năm 2009, Công ty Hồng Tân Phát và hệ thống phân phối kem tại Việt Nam.',
    },
    contact: {
      title: 'Liên hệ Mingo Ice Cream — Kinh doanh và hỗ trợ khách hàng',
      description: 'Liên hệ Mingo Ice Cream để được hỗ trợ về sản phẩm, kinh doanh, phân phối, truyền thông và cơ hội hợp tác.',
    },
  },
  en: {
    home: {
      title: 'Mingo Ice Cream Vietnam — Bars, tubs and cones',
      description: 'Discover Mingo ice cream in Vietnam, including ice cream bars, tubs, cones and refreshing flavours for every joyful moment.',
    },
    products: {
      title: 'Mingo ice cream products — Bars, tubs, cups and cones',
      description: 'Explore Mingo ice cream bars, tubs, cups, cones and signature flavour collections available in Vietnam.',
    },
    brands: {
      title: 'Mingo ice cream brands — Explore our product ranges',
      description: 'Explore the brands and ice cream ranges from Mingo, from fruity favourites to creamy desserts and frozen treats.',
    },
    about: {
      title: 'About Mingo Ice Cream — Our story, brands and distribution',
      description: 'Learn about Mingo Ice Cream, Hong Tan Phat Company and our journey serving ice cream in Vietnam since 2009.',
    },
    contact: {
      title: 'Contact Mingo Ice Cream — Sales and customer support',
      description: 'Contact Mingo Ice Cream for product support, sales, distribution, media enquiries and partnership opportunities.',
    },
  },
} as const;
