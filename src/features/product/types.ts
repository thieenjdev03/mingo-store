/**
 * TẦNG 2 — View model của feature product.
 * Component chỉ nhận các type ở đây (đã resolve locale, đã tính giá),
 * KHÔNG bao giờ nhận raw API type. Đổi shape API -> chỉ sửa mapper.
 */
import type { ProductResponseDto, ProductVariantResponseDto } from '@/lib/api/generated/ecomAPI.schemas';
import { resolveLocalized, type Locale } from '@/types/localized';
import type { ProductDetailApiDto, SizeMeta } from './api';

export interface ProductVariantView {
  sku: string;
  /** Nhãn chính = tên quy cách, vd "Cây 65gr". */
  label: string;
  /** Nhãn phụ số lượng đóng thùng, vd "Thùng 30 cây". Null khi thiếu packQty. */
  packLabel: string | null;
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
  /** Quy cách đại diện trên card đang tạm hết hàng; khi true phải ẩn giá. */
  specOutOfStock: boolean;
  /**
   * Giá theo yêu cầu: khi bật cờ "Nổi bật" (is_featured) ở admin, storefront KHÔNG
   * công khai giá mà hiển thị "liên hệ để nhận báo giá" thay cho giá bán.
   */
  priceOnRequest: boolean;
}

export interface ProductDetailView extends ProductCardView {
  images: string[];
  /** Mô tả HTML đã được backend sanitize. */
  descriptionHtml: string | null;
  categoryName: string | null;
  categoryId: string | null;
  categorySlug: string | null;
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

/** Không đưa dữ liệu seed/QA như "Test" hoặc "SP A" lên storefront và sitemap. */
export function isPublicCatalogProduct(product: { name: string; slug?: string }): boolean {
  const values = [product.name, product.slug ?? ''].map((value) => value.trim());
  return !values.some((value) => /^(?:test|sp(?:[\s_-]+[a-z0-9]+)?)$/i.test(value));
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
  volumeUnit?: string | null;
}): string {
  if (size.name?.trim()) return size.name.trim();
  if (size.volumeMl) return `${size.unit ?? 'Hộp'} ${size.volumeMl}${size.volumeUnit ?? 'ml'}`;
  if (size.packQty) return `${size.packQty} ${size.unit ?? ''}/thùng`.trim();
  return size.name;
}

/**
 * Nhãn phụ số lượng đóng thùng cho PDP, vd "Thùng 30 cây". Khối lượng đã nằm trong
 * tên quy cách ("Cây 65gr") nên nhãn phụ chỉ mô tả quy cách đóng thùng. Null khi thiếu packQty.
 */
export function packagingCartonLabel(size: Pick<SizeMeta, 'packQty' | 'unit'>): string | null {
  if (size.packQty == null || size.packQty <= 0) return null;
  const unit = size.unit?.trim();
  return `Thùng ${size.packQty}${unit ? ` ${unit}` : ''}`;
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
  const firstVariant = p.variants?.[0];
  const price = getEffectivePrice(p, firstVariant);
  const hasVariants = Boolean(p.variants?.length);
  const anyVariantInStock = p.variants?.some((variant) => Number(variant.stock) > 0) ?? false;
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
    available:
      p.status === 'active' &&
      (hasVariants ? anyVariantInStock : Number(p.stock_quantity) > 0),
    spec: firstVariant?.size
      ? packagingLabel(firstVariant.size)
      : firstVariant
        ? resolveLocalized(firstVariant.name, locale)
        : null,
    specOutOfStock: Boolean(firstVariant && Number(firstVariant.stock) <= 0),
    priceOnRequest: p.is_featured === true,
  };
}

export function toProductDetailView(
  p: ProductResponseDto,
  locale: Locale,
  sizeMetaById?: Map<string, SizeMeta>,
): ProductDetailView {
  const images = [...new Set(p.images.filter((image) => image.trim().length > 0))];
  const variants: ProductVariantView[] = (p.variants ?? []).map((v) => {
    // Trục variant = quy cách đóng gói. Nhãn chính = tên quy cách ("Cây 65gr"); nhãn phụ = SL đóng thùng.
    // Thuộc tính đầy đủ fetch qua /sizes vì API sản phẩm chỉ nhúng {id, name}.
    const meta = v.size?.id ? sizeMetaById?.get(v.size.id) : undefined;
    const label = meta
      ? meta.name
      : v.size
        ? packagingLabel(v.size)
        : resolveLocalized(v.name, locale);
    return {
      sku: v.sku,
      label,
      packLabel: meta ? packagingCartonLabel(meta) : null,
      price: getEffectivePrice(p, v),
      stock: v.stock,
      inStock: v.stock > 0,
    };
  });

  return {
    ...toProductCardView(p, locale),
    images,
    variants,
    // Backend đã sanitize HTML; giữ markup để hiển thị đúng nội dung quản trị nhập.
    descriptionHtml: resolveLocalized(p.description, locale) || null,
    categoryName: p.category?.name ?? null,
    categoryId: p.category?.id ?? null,
    categorySlug: p.category?.slug ?? null,
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
    purchasable:
      p.status === 'active' &&
      (variants.length > 0 ? variants.some((variant) => variant.inStock) : p.stock_quantity > 0),
  };
}
