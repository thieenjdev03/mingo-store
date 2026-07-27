export interface SizeCategoryView {
  id: string;
  name: string;
}

export interface AdminSizeView {
  id: string;
  name: string;
  unit: string | null;
  packQty: number | null;
  volumeMl: number | null;
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
  sortOrder?: number;
  categoryIds?: string[];
}
