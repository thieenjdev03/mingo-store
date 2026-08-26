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
  /** Tên biến thể do quản trị viên đặt, dùng cho chế độ chip khi danh sách dài. */
  name: string;
  /** Nhãn chính = tên quy cách, vd "Cây 65gr". */
  label: string;
  /** Nhãn phụ số lượng đóng thùng, vd "30 cây / thùng". Null khi thiếu packQty. */
  packLabel: string | null;
  price: number;
  stock: number;
  inStock: boolean;
  /** Ảnh đại diện riêng của biến thể; null thì gallery dùng ảnh chính sản phẩm. */
  image: string | null;
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
  /** Không có giá sản phẩm và cũng không có biến thể nào có giá. */
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
  /** SKU được chọn khi mở PDP: biến thể còn hàng đầu tiên, nếu không có thì phần tử đầu. */
  defaultVariantSku: string | null;
  /** Trạng thái dẫn xuất cho PDP; UI không phải đọc/diễn giải raw API. */
  hasVariants: boolean;
  /** Không có giá sản phẩm và cũng không có biến thể nào có giá. */
  isContactForPrice: boolean;
  /** Hết hàng theo tồn của biến thể, hoặc tồn sản phẩm khi không có biến thể. */
  isOutOfStock: boolean;
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
 * Nhãn phụ số lượng đóng thùng cho PDP, vd "30 cây / thùng". Khối lượng đã nằm trong
 * tên quy cách ("Cây 65gr") nên nhãn phụ chỉ mô tả quy cách đóng thùng. Null khi thiếu packQty.
 */
export function packagingCartonLabel(size: Pick<SizeMeta, 'packQty' | 'unit'>): string | null {
  if (size.packQty == null || size.packQty <= 0) return null;
  const unit = size.unit?.trim();
  return `${size.packQty}${unit ? ` ${unit}` : ''} / thùng`;
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

/**
 * Các trạng thái mua hàng dùng chung cho card và PDP. Giữ việc suy luận ở tầng
 * view-model để component không phải diễn giải raw API data.
 */
interface ProductPurchaseState {
  hasVariants: boolean;
  isContactForPrice: boolean;
  isOutOfStock: boolean;
}

function derivePurchaseState(product: ProductResponseDto): ProductPurchaseState {
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  // Giá 0 = chưa nhập giá (admin để trống khi bật LH Báo Giá), tính như không có giá.
  const noPrice = (value: unknown) => value == null || Number(value) <= 0;
  const isContactForPrice =
    noPrice(product.price) &&
    (!hasVariants || variants.every((variant) => noPrice(variant.price)));
  const isOutOfStock = hasVariants
    ? variants.every((variant) => Number(variant.stock) === 0)
    : Number(product.stock_quantity) === 0;

  return { hasVariants, isContactForPrice, isOutOfStock };
}

export function toProductCardView(
  p: ProductResponseDto,
  locale: Locale,
  purchaseState: ProductPurchaseState = derivePurchaseState(p),
): ProductCardView {
  const firstVariant = p.variants?.[0];
  const price = getEffectivePrice(p, firstVariant);
  const { hasVariants, isContactForPrice } = purchaseState;
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
    priceOnRequest: isContactForPrice,
  };
}

export function toProductDetailView(
  p: ProductResponseDto,
  locale: Locale,
  sizeMetaById?: Map<string, SizeMeta>,
): ProductDetailView {
  const purchaseState = derivePurchaseState(p);
  const { hasVariants, isContactForPrice, isOutOfStock } = purchaseState;
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
      name: resolveLocalized(v.name, locale),
      label,
      packLabel: meta ? packagingCartonLabel(meta) : null,
      price: getEffectivePrice(p, v),
      stock: v.stock,
      inStock: v.stock > 0,
      image: v.image_url?.trim() || null,
    };
  });

  const defaultVariantSku =
    variants.find((variant) => variant.inStock)?.sku ?? variants[0]?.sku ?? null;

  return {
    ...toProductCardView(p, locale, purchaseState),
    images: p.images,
    variants,
    defaultVariantSku,
    hasVariants,
    isContactForPrice,
    isOutOfStock,
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
