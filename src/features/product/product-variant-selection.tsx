'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface ProductVariantSelectionValue {
  selectedSku: string | null;
  selectVariant: (sku: string) => void;
}

const ProductVariantSelectionContext = createContext<ProductVariantSelectionValue | null>(null);

interface ProductVariantSelectionProviderProps {
  initialSku: string | null;
  children: ReactNode;
}

/** Đồng bộ biến thể đang chọn giữa bảng/chip mua hàng và gallery ảnh trên PDP. */
export function ProductVariantSelectionProvider({
  initialSku,
  children,
}: ProductVariantSelectionProviderProps) {
  const [selectedSku, setSelectedSku] = useState<string | null>(initialSku);

  return (
    <ProductVariantSelectionContext.Provider
      value={{ selectedSku, selectVariant: setSelectedSku }}
    >
      {children}
    </ProductVariantSelectionContext.Provider>
  );
}

export function useProductVariantSelection() {
  const context = useContext(ProductVariantSelectionContext);
  if (!context) {
    throw new Error('useProductVariantSelection must be used within ProductVariantSelectionProvider');
  }
  return context;
}
