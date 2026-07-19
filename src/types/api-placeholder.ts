/**
 * ⚠️ PLACEHOLDER — XOÁ FILE NÀY sau khi backend export docs/openapi.json
 * và chạy `npm run api:gen` (orval sinh types thật vào src/lib/api/generated).
 *
 * Shape dưới đây bám theo tài liệu backend §3 (products JSONB, variant nhúng, snake_case)
 * chỉ để mapper/feature compile được trong lúc chờ codegen.
 */
import type { LocalizedString } from './localized';

export interface ApiProductVariant {
  sku: string;
  name: LocalizedString;
  price: number | null;
  stock: number;
  size_id: string | null;
  color_id: string | null;
  barcode?: string | null;
  image_url?: string | null;
}

export interface ApiCategory {
  id: string;
  name: LocalizedString;
  slug: LocalizedString;
}

export interface ApiCollection {
  id: string;
  name: LocalizedString;
  slug: string;
}

export interface ApiProduct {
  id: string;
  name: LocalizedString;
  slug: LocalizedString;
  description: LocalizedString;
  price: number;
  sale_price: number | null;
  images: string[];
  stock_quantity: number;
  status: 'active' | 'inactive' | 'draft' | 'out_of_stock' | 'discontinued';
  is_featured: boolean;
  tags: string[];
  category: ApiCategory | null;
  collections?: ApiCollection[];
  variants: ApiProductVariant[];
}
