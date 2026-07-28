import type {
  StorefrontCollectionDto,
  StorefrontHomeDto,
} from '@/lib/api/generated/ecomAPI.schemas';
import {
  toProductCardView,
  type ProductCardView,
} from '@/features/product/types';
import type { Locale } from '@/types/localized';

export interface HeroBannerView {
  id: string;
  imageUrl: string;
  mobileImageUrl: string | null;
  alt: string;
  ctaLabel: string | null;
  linkUrl: string;
}

export interface HomeCollectionView {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  /** Section trang chủ mà collection này đại diện (vd 'must_try'). */
  homepageSection: string | null;
  products: ProductCardView[];
}

export interface StorefrontHomeView {
  heroes: HeroBannerView[];
  sections: HomeCollectionView[];
}

function toHeroView(collection: StorefrontCollectionDto): HeroBannerView | null {
  if (!collection.bannerImageUrl) return null;
  return {
    id: collection.id,
    imageUrl: collection.bannerImageUrl,
    mobileImageUrl: collection.mobileBannerImageUrl ?? null,
    alt: collection.name,
    ctaLabel: collection.ctaLabel ?? null,
    linkUrl: `/collections/${collection.slug}`,
  };
}

export function toStorefrontHomeView(
  home: StorefrontHomeDto,
  locale: Locale,
): StorefrontHomeView {
  return {
    heroes: home.heroCollections.flatMap((collection) => {
      const hero = toHeroView(collection);
      return hero ? [hero] : [];
    }),
    sections: home.homeSections
      .map((collection) => ({
        id: collection.id,
        slug: collection.slug,
        title: collection.name,
        description: collection.description ?? null,
        homepageSection: collection.homepageSection ?? null,
        products: collection.products.map((product) =>
          toProductCardView(product, locale),
        ),
      }))
      .filter((collection) => collection.products.length > 0),
  };
}
