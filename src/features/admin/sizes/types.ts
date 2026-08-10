export interface SizeCategoryView {
  id: string;
  name: string;
}

export interface AdminSizeView {
  id: string;
  name: string;
  unit: string | null;
  packQty: number | null;
  /** Giá trị khối lượng/dung tích (số). Tên field giữ `volumeMl` để tương thích, đơn vị ở `volumeUnit`. */
  volumeMl: number | null;
  /** Đơn vị của khối lượng/dung tích (ml | gr | kg | lít). null = dữ liệu cũ, hiểu mặc định là "ml". */
  volumeUnit: string | null;
  sortOrder: number;
  categories: SizeCategoryView[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveSizeInput {
  name: string;
  unit?: string;
  packQty?: number;
  volumeMl?: number;
  volumeUnit?: string;
  sortOrder?: number;
  categoryIds?: string[];
}

/** Đơn vị khối lượng/dung tích cho quy cách. */
export const VOLUME_UNITS = ['ml', 'gr', 'kg', 'lít'] as const;
