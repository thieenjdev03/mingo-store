export interface CartItem {
  productId: string;
  slug: string;
  sku: string; // sku của variant (hoặc chính product nếu không có variant)
  name: string;
  variantLabel: string | null; // "24 Cây/Thùng"
  image: string | null;
  /** Giá snapshot lúc thêm vào giỏ — checkout sẽ validate lại với server trước khi thanh toán */
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; sku: string }
  | { type: 'SET_QTY'; sku: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; state: CartState };
