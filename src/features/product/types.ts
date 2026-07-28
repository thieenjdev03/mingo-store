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
  compareAtPrice: number | null;
  stock: number;
  available: boolean;
}

export interface ProductDetailView extends ProductCardView {
  images: string[];
  descriptionMarkdown: string;
  categoryName: string | null;
  /** Khối lượng theo kg (backend), null nếu chưa nhập. */
  weightKg: number | null;
  weightGrams: number | null;
  allergens: string[];
  nutrition: Record<string, unknown> | null;
  barcode: string | null;
  collectionName: string | null;
  collectionSlug: string | null;
  variants: ProductVariantView[];
  purchasable: boolean;
}

/** Bỏ tag HTML + gộp khoảng trắng -> text thuần (mô tả sản phẩm import có thể chứa <p>, <br>...). */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

export function toProductCardView(p: ProductResponseDto, locale: Locale): ProductCardView {
  const price = getEffectivePrice(p);
  return {
    id: p.id,
    slug: resolveLocalized(p.slug, locale),
    name: resolveLocalized(p.name, locale),
    image: p.images[0] ?? null,
    price,
    compareAtPrice:
      p.compare_at_price != null && Number(p.compare_at_price) > price
        ? Number(p.compare_at_price)
        : null,
    stock: Number(p.stock_quantity),
    available: p.status === 'active' && Number(p.stock_quantity) > 0,
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
    // Mô tả từ backend có thể là HTML (sản phẩm import) — bỏ tag để hiển thị text sạch trong accordion.
    descriptionMarkdown: stripHtml(resolveLocalized(p.description, locale)),
    categoryName: p.category?.name ?? null,
    weightKg: p.weight ?? null,
    weightGrams: p.weight_grams ?? null,
    allergens: p.allergens ?? [],
    nutrition:
      p.nutrition && typeof p.nutrition === 'object'
        ? (p.nutrition as Record<string, unknown>)
        : null,
    barcode: p.barcode ?? null,
    collectionName: p.collections?.[0]?.name ?? null,
    collectionSlug: p.collections?.[0]?.slug ?? null,
    purchasable: p.status === 'active' && p.stock_quantity > 0,
  };
}
