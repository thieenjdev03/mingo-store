export interface SizeCategoryView {
  id: string;
  name: string;
}

export interface AdminSizeView {
  id: string;
  name: string;
  sortOrder: number;
  categories: SizeCategoryView[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveSizeInput {
  name: string;
  sortOrder?: number;
  categoryIds?: string[];
}
