/**
 * TẦNG 2 — View model của feature product.
 * Component chỉ nhận các type ở đây (đã resolve locale, đã tính giá),
 * KHÔNG bao giờ nhận raw API type. Đổi shape API -> chỉ sửa mapper.
 */
import type { ProductResponseDto, ProductVariantResponseDto } from '@/lib/api/generated/ecomAPI.schemas';
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
export function getEffectivePrice(product: Pick<ProductResponseDto, 'price' | 'sale_price'>, variant?: ProductVariantResponseDto | null): number {
  if (variant?.price != null) return Number(variant.price);
  return Number(product.sale_price ?? product.price);
}

export function toProductCardView(p: ProductResponseDto, locale: Locale): ProductCardView {
  return {
    id: p.id,
    slug: resolveLocalized(p.slug, locale),
    name: resolveLocalized(p.name, locale),
    image: p.images[0] ?? null,
    price: getEffectivePrice(p),
  };
}

export function toProductDetailView(p: ProductResponseDto, locale: Locale): ProductDetailView {
  const variants: ProductVariantView[] = (p.variants ?? []).map((v) => ({
    sku: v.sku,
    label: resolveLocalized(v.name, locale),
    price: getEffectivePrice(p, v),
    stock: v.stock,
    inStock: v.stock > 0,
  }));

  return {
    ...toProductCardView(p, locale),
    images: p.images,
    variants,
    descriptionMarkdown: resolveLocalized(p.description, locale),
    categoryName: p.category?.name ?? null,
    // collections omitted: backend doesn't populate productCollections in the response yet — see follow-up
    collectionName: null,
    collectionSlug: null,
    purchasable: p.status === 'active' && (variants.some((v) => v.inStock) || p.stock_quantity > 0),
  };
}
