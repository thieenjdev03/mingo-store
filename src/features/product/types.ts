/**
 * TẦNG 2 — View model của feature product.
 * Component chỉ nhận các type ở đây (đã resolve locale, đã tính giá),
 * KHÔNG bao giờ nhận raw API type. Đổi shape API -> chỉ sửa mapper.
 */
import type { ProductResponseDto, ProductVariantResponseDto } from '@/lib/api/generated/ecomAPI.schemas';
import { resolveLocalized, type Locale } from '@/types/localized';
import type { ProductDetailApiDto } from './api';

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
  compareAtPrice: number | null;
  stock: number;
  available: boolean;
  /** Nhãn quy cách đại diện dùng ở product card, ưu tiên size của variant đầu tiên. */
  spec: string | null;
}

export interface ProductDetailView extends ProductCardView {
  images: string[];
  /** Mô tả HTML đã được backend sanitize. */
  descriptionHtml: string | null;
  categoryName: string | null;
  /** Khối lượng theo kg (backend), null nếu chưa nhập. */
  weightKg: number | null;
  weightGrams: number | null;
  allergensHtml: string | null;
  usageHtml: string | null;
  notesHtml: string | null;
  brandName: string | null;
  brandSlug: string | null;
  barcode: string | null;
  collectionName: string | null;
  collectionSlug: string | null;
  variants: ProductVariantView[];
  purchasable: boolean;
}

/**
 * Nhãn quy cách đóng gói từ `size` (API sizes mở rộng). Luôn ưu tiên `name` (đã đúng định dạng:
 * "24 cây / thùng", "Hộp 250ml"); chỉ build từ field khi thiếu name.
 */
export function packagingLabel(size: {
  name: string;
  unit?: string | null;
  packQty?: number | null;
  volumeMl?: number | null;
}): string {
  if (size.name?.trim()) return size.name.trim();
  if (size.volumeMl) return `${size.unit ?? 'Hộp'} ${size.volumeMl}ml`;
  if (size.packQty) return `${size.packQty} ${size.unit ?? ''}/thùng`.trim();
  return size.name;
}

/** Quy tắc giá hiệu lực THỐNG NHẤT toàn site: variant.price ?? sale_price ?? price */
export function getEffectivePrice(product: Pick<ProductResponseDto, 'price' | 'sale_price'>, variant?: ProductVariantResponseDto | null): number {
  if (variant?.price != null) return Number(variant.price);
  return Number(product.sale_price ?? product.price);
}

/** Backend chỉ còn `weight` (kg); UI cần gram cho nhãn quy cách. */
export function weightKgToGrams(weight: number | null | undefined): number | null {
  return weight != null ? Math.round(Number(weight) * 1000) : null;
}

/** % giảm giá so với giá gốc (làm tròn). Null khi không có khuyến mãi hợp lệ. */
export function discountPercent(price: number, compareAtPrice: number | null): number | null {
  if (compareAtPrice == null || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function toProductCardView(p: ProductResponseDto, locale: Locale): ProductCardView {
  const price = getEffectivePrice(p);
  const firstVariant = p.variants?.[0];
  return {
    id: p.id,
    slug: resolveLocalized(p.slug, locale),
    name: resolveLocalized(p.name, locale),
    image: p.images[0] ?? null,
    price,
    // Giá gạch = giá gốc, chỉ hiện khi đang có giá KM thấp hơn và bật nhãn giảm giá.
    compareAtPrice:
      p.enable_sale_tag && p.sale_price != null && Number(p.price) > Number(p.sale_price)
        ? Number(p.price)
        : null,
    stock: Number(p.stock_quantity),
    available: p.status === 'active' && Number(p.stock_quantity) > 0,
    spec: firstVariant?.size
      ? packagingLabel(firstVariant.size)
      : firstVariant
        ? resolveLocalized(firstVariant.name, locale)
        : null,
  };
}

export function toProductDetailView(p: ProductResponseDto, locale: Locale): ProductDetailView {
  const variants: ProductVariantView[] = (p.variants ?? []).map((v) => ({
    sku: v.sku,
    // Trục variant = quy cách đóng gói: ưu tiên nhãn từ size, fallback tên variant (mockup chưa có size).
    label: v.size ? packagingLabel(v.size) : resolveLocalized(v.name, locale),
    price: getEffectivePrice(p, v),
    stock: v.stock,
    inStock: v.stock > 0,
  }));

  return {
    ...toProductCardView(p, locale),
    images: p.images,
    variants,
    // Backend đã sanitize HTML; giữ markup để hiển thị đúng nội dung quản trị nhập.
    descriptionHtml: resolveLocalized(p.description, locale) || null,
    categoryName: p.category?.name ?? null,
    weightKg: p.weight ?? null,
    weightGrams: weightKgToGrams(p.weight),
    allergensHtml: resolveLocalized(p.short_description, locale) || null,
    usageHtml:
      resolveLocalized(
        (p as ProductDetailApiDto).usage_instructions ?? (p as ProductDetailApiDto).nutrition_information,
        locale,
      ) || null,
    notesHtml: resolveLocalized((p as ProductDetailApiDto).notes, locale) || null,
    brandName: p.brand?.name ?? null,
    brandSlug: p.brand?.slug ?? null,
    barcode: p.barcode ?? null,
    collectionName: p.collections?.[0]?.name ?? null,
    collectionSlug: p.collections?.[0]?.slug ?? null,
    purchasable: p.status === 'active' && p.stock_quantity > 0,
  };
}
