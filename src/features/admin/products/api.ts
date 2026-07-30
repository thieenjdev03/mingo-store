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

export type ProductWithNutrition = ProductResponseDto & {
  nutrition_information?: string | null;
};

export type ProductCreatePayload = CreateProductDto & {
  brand_id?: string | null;
  nutrition_information?: LocalizedStringDto;
};

export type ProductUpdatePayload = UpdateProductDto & {
  brand_id?: string | null;
  nutrition_information?: LocalizedStringDto;
};

export function productsKey(params: ProductsControllerFindAllParams) {
  return ['/products', 'admin', params] as const;
}
export function listProducts(params: ProductsControllerFindAllParams) {
  return productsControllerFindAll(params);
}

/** Bản edit song ngữ: gộp giá trị resolved của 2 locale thành {vi,en}. */
export interface ProductEditData {
  base: ProductWithNutrition;
  name: { vi: string; en: string };
  slug: { vi: string; en: string };
  description: { vi: string; en: string };
  short_description: { vi: string; en: string };
  nutrition_information: { vi: string; en: string };
}

export async function getProductForEdit(id: string): Promise<ProductEditData> {
  const [vi, en] = await Promise.all([
    productsControllerFindOne(id, { locale: 'vi' }),
    productsControllerFindOne(id, { locale: 'en' }),
  ]);
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  const viProduct = vi as ProductWithNutrition;
  const enProduct = en as ProductWithNutrition;
  return {
    base: viProduct,
    name: { vi: s(vi.name), en: s(en.name) },
    slug: { vi: s(vi.slug), en: s(en.slug) },
    description: { vi: s(vi.description), en: s(en.description) },
    short_description: { vi: s(vi.short_description), en: s(en.short_description) },
    nutrition_information: {
      vi: s(viProduct.nutrition_information),
      en: s(enProduct.nutrition_information),
    },
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
