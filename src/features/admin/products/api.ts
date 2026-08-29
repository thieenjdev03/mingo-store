/**
 * Data-layer admin cho Sản phẩm (/products). List = ProductListDto { data, meta }.
 * Read resolve theo locale nên để sửa song ngữ ta fetch cả vi + en rồi ghép {vi,en}.
 */
import {
  productsControllerFindAll,
  productsControllerFindOne,
  productsControllerCreate,
  productsControllerUpdate,
  productsControllerRemove,
} from '@/lib/api/generated/products/products';
import type {
  ProductsControllerFindAllParams,
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  LocalizedStringDto,
} from '@/lib/api/generated/ecomAPI.schemas';

/**
 * Tồn kho thật của sản phẩm: có biến thể thì backend không lưu `stock_quantity`
 * (từ chối khi gửi kèm) nên tồn nằm ở từng biến thể.
 */
export function productStockTotal(product: Pick<ProductResponseDto, 'stock_quantity' | 'variants'>): number {
  if (!product.variants?.length) return Number(product.stock_quantity) || 0;
  return product.variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
}

export type ProductWithUsage = ProductResponseDto & {
  nutrition_information?: string | null;
  usage_instructions?: string | null;
  notes?: string | null;
};

export type ProductCreatePayload = CreateProductDto & {
  brand_id?: string | null;
  nutrition_information?: LocalizedStringDto;
  usage_instructions?: LocalizedStringDto;
  notes?: LocalizedStringDto;
};

export type ProductUpdatePayload = UpdateProductDto & {
  brand_id?: string | null;
  nutrition_information?: LocalizedStringDto;
  usage_instructions?: LocalizedStringDto;
  notes?: LocalizedStringDto;
};

export function productsKey(params: ProductsControllerFindAllParams) {
  return ['/products', 'admin', params] as const;
}
export function listProducts(params: ProductsControllerFindAllParams) {
  return productsControllerFindAll(params);
}

/** Bản edit song ngữ: gộp giá trị resolved của 2 locale thành {vi,en}. */
export interface ProductEditData {
  base: ProductWithUsage;
  name: { vi: string; en: string };
  slug: { vi: string; en: string };
  description: { vi: string; en: string };
  short_description: { vi: string; en: string };
  usage_instructions: { vi: string; en: string };
  notes: { vi: string; en: string };
}

export async function getProductForEdit(id: string): Promise<ProductEditData> {
  const [vi, en] = await Promise.all([
    productsControllerFindOne(id, { locale: 'vi' }),
    productsControllerFindOne(id, { locale: 'en' }),
  ]);
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  const viProduct = vi as ProductWithUsage;
  const enProduct = en as ProductWithUsage;
  return {
    base: viProduct,
    name: { vi: s(vi.name), en: s(en.name) },
    slug: { vi: s(vi.slug), en: s(en.slug) },
    description: { vi: s(vi.description), en: s(en.description) },
    short_description: { vi: s(vi.short_description), en: s(en.short_description) },
    usage_instructions: {
      vi: s(viProduct.usage_instructions ?? viProduct.nutrition_information),
      en: s(enProduct.usage_instructions ?? enProduct.nutrition_information),
    },
    notes: { vi: s(viProduct.notes), en: s(enProduct.notes) },
  };
}

export function createProduct(dto: ProductCreatePayload, locale = 'vi') {
  return productsControllerCreate(dto as CreateProductDto, { locale });
}
export function updateProduct(id: string, dto: ProductUpdatePayload, locale = 'vi') {
  return productsControllerUpdate(id, dto as UpdateProductDto, { locale });
}
export function deleteProduct(id: string) {
  return productsControllerRemove(id);
}
