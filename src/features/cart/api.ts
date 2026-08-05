import { customFetch } from '@/lib/api/fetcher';
import { getOrCreateCartToken } from './cart-token';
import {
  toCartView,
  type AddCartItemDto,
  type CartResponseDto,
  type CartView,
  type UpdateCartItemDto,
} from './types';

function cartHeaders(): Record<string, string> {
  return { 'X-Cart-Token': getOrCreateCartToken() };
}

export async function getCart(locale: string): Promise<CartView> {
  const response = await customFetch<CartResponseDto>({
    url: '/cart',
    method: 'GET',
    params: { locale },
    headers: cartHeaders(),
  });
  return toCartView(response);
}

export async function addCartItem(
  dto: AddCartItemDto,
  locale: string,
): Promise<CartView> {
  const response = await customFetch<CartResponseDto>({
    url: '/cart/items',
    method: 'POST',
    params: { locale },
    data: dto,
    headers: cartHeaders(),
  });
  return toCartView(response);
}

export async function updateCartItem(
  itemId: string,
  dto: UpdateCartItemDto,
  locale: string,
): Promise<CartView> {
  const response = await customFetch<CartResponseDto>({
    url: `/cart/items/${encodeURIComponent(itemId)}`,
    method: 'PATCH',
    params: { locale },
    data: dto,
    headers: cartHeaders(),
  });
  return toCartView(response);
}

export async function removeCartItem(
  itemId: string,
  locale: string,
): Promise<CartView> {
  const response = await customFetch<CartResponseDto>({
    url: `/cart/items/${encodeURIComponent(itemId)}`,
    method: 'DELETE',
    params: { locale },
    headers: cartHeaders(),
  });
  return toCartView(response);
}

export async function clearCart(): Promise<void> {
  await customFetch<unknown>({
    url: '/cart',
    method: 'DELETE',
    headers: cartHeaders(),
  });
}

export async function mergeCart(locale = 'vi'): Promise<CartView> {
  const response = await customFetch<CartResponseDto>({
    url: '/cart/merge',
    method: 'POST',
    params: { locale },
    headers: cartHeaders(),
  });
  return toCartView(response);
}
