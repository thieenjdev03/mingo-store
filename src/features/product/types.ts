/**
 * TẦNG 2 — View model của feature product.
 * Component chỉ nhận các type ở đây (đã resolve locale, đã tính giá),
 * KHÔNG bao giờ nhận raw API type. Đổi shape API -> chỉ sửa mapper.
 */
import type { ApiProduct, ApiProductVariant } from '@/types/api-placeholder'; // TODO: đổi sang '@/lib/api/generated' sau api:gen
import { resolveLocalized, type Locale } from '@/types/localized';

export interface ProductVariantView {
  sku: string;
  /** "24 Cây/Thùng" */
  label: string;
  price: number;
  stock: number;
  inStock: boolean;
}

export interface ProductCardView {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
}

export interface ProductDetailView extends ProductCardView {
  images: string[];
  descriptionMarkdown: string;
  categoryName: string | null;
  collectionName: string | null;
  collectionSlug: string | null;
  variants: ProductVariantView[];
  purchasable: boolean;
}

/** Quy tắc giá hiệu lực THỐNG NHẤT toàn site: variant.price ?? sale_price ?? price */
export function getEffectivePrice(product: Pick<ApiProduct, 'price' | 'sale_price'>, variant?: ApiProductVariant | null): number {
  if (variant?.price != null) return Number(variant.price);
  return Number(product.sale_price ?? product.price);
}

export function toProductCardView(p: ApiProduct, locale: Locale): ProductCardView {
  return {
    id: p.id,
    slug: resolveLocalized(p.slug, locale),
    name: resolveLocalized(p.name, locale),
    image: p.images[0] ?? null,
    price: getEffectivePrice(p),
  };
}

export function toProductDetailView(p: ApiProduct, locale: Locale): ProductDetailView {
  const variants: ProductVariantView[] = p.variants.map((v) => ({
    sku: v.sku,
    label: resolveLocalized(v.name, locale),
    price: getEffectivePrice(p, v),
    stock: v.stock,
    inStock: v.stock > 0,
  }));

  const firstCollection = p.collections?.[0] ?? null;

  return {
    ...toProductCardView(p, locale),
    images: p.images,
    variants,
    descriptionMarkdown: resolveLocalized(p.description, locale),
    categoryName: p.category ? resolveLocalized(p.category.name, locale) : null,
    collectionName: firstCollection ? resolveLocalized(firstCollection.name, locale) : null,
    collectionSlug: firstCollection?.slug ?? null,
    purchasable: p.status === 'active' && (variants.some((v) => v.inStock) || p.stock_quantity > 0),
  };
}
