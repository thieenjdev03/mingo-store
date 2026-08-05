/**
 * TẦNG 1 (khai báo tay) — backend chưa có module /cart nên các DTO này chưa có trong
 * `@/lib/api/generated`. Frontend chạy trước; khi backend build xong sẽ chuyển sang type generated.
 */
export interface CartResponseDto {
  id: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: number | string;
    lineTotal: number | string;
    product: {
      id: string;
      name: string;
      slug: string;
      image: string | null;
      stock: number | string;
      available: boolean;
    };
  }[];
  subtotal: number | string;
  totalQuantity: number | string;
  valid: boolean;
}

export interface AddCartItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartProductView {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  stock: number;
  available: boolean;
}

export interface CartItemView {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: CartProductView;
}

export interface CartView {
  id: string | null;
  items: CartItemView[];
  subtotal: number;
  totalQuantity: number;
  valid: boolean;
}

export const EMPTY_CART: CartView = {
  id: null,
  items: [],
  subtotal: 0,
  totalQuantity: 0,
  valid: false,
};

export function toCartView(cart: CartResponseDto): CartView {
  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
      product: {
        ...item.product,
        stock: Number(item.product.stock),
      },
    })),
    subtotal: Number(cart.subtotal),
    totalQuantity: Number(cart.totalQuantity),
    valid: cart.valid,
  };
}
