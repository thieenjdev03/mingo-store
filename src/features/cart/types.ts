import type {
  AddCartItemDto,
  CartResponseDto,
  UpdateCartItemDto,
} from '@/lib/api/generated/ecomAPI.schemas';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/features/product/types';

export type { AddCartItemDto, CartResponseDto, UpdateCartItemDto };

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
  variantSku: string | null;
  variantName: string | null;
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
      variantSku: item.variantSku ?? null,
      variantName: item.variantName ?? null,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
      product: {
        ...item.product,
        image: item.product.image ?? PRODUCT_PLACEHOLDER_IMAGE,
        stock: Number(item.product.stock),
      },
    })),
    subtotal: Number(cart.subtotal),
    totalQuantity: Number(cart.totalQuantity),
    valid: cart.valid,
  };
}
