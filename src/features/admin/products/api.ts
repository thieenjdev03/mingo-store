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
} from '@/lib/api/generated/ecomAPI.schemas';

export function productsKey(params: ProductsControllerFindAllParams) {
  return ['/products', 'admin', params] as const;
}
export function listProducts(params: ProductsControllerFindAllParams) {
  return productsControllerFindAll(params);
}

/** Bản edit song ngữ: gộp giá trị resolved của 2 locale thành {vi,en}. */
export interface ProductEditData {
  base: ProductResponseDto;
  name: { vi: string; en: string };
  slug: { vi: string; en: string };
  description: { vi: string; en: string };
  short_description: { vi: string; en: string };
}

export async function getProductForEdit(id: string): Promise<ProductEditData> {
  const [vi, en] = await Promise.all([
    productsControllerFindOne(id, { locale: 'vi' }),
    productsControllerFindOne(id, { locale: 'en' }),
  ]);
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    base: vi,
    name: { vi: s(vi.name), en: s(en.name) },
    slug: { vi: s(vi.slug), en: s(en.slug) },
    description: { vi: s(vi.description), en: s(en.description) },
    short_description: { vi: s(vi.short_description), en: s(en.short_description) },
  };
}

export function createProduct(dto: CreateProductDto, locale = 'vi') {
  return productsControllerCreate(dto, { locale });
}
export function updateProduct(id: string, dto: UpdateProductDto, locale = 'vi') {
  return productsControllerUpdate(id, dto, { locale });
}
export function deleteProduct(id: string) {
  return productsControllerRemove(id);
}
