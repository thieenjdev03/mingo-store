import { customFetch } from '@/lib/api/fetcher';
import { getOrCreateCartToken } from '@/features/cart/cart-token';
import type {
  CheckoutQuoteDto,
  CheckoutQuoteView,
  CreateCheckoutOrderDto,
  CreateOrderResult,
  OrderView,
  ShippingAddressInput,
  ShippingAddressView,
  ShippingQuoteDto,
  ShippingQuoteView,
  VnpayReturnState,
} from './types';

function cartHeaders(): Record<string, string> {
  return { 'X-Cart-Token': getOrCreateCartToken() };
}

export function quoteShipping(dto: ShippingQuoteDto): Promise<ShippingQuoteView> {
  return customFetch<ShippingQuoteView>({
    url: '/shipping/quote',
    method: 'POST',
    data: dto,
  });
}

export function upsertShippingAddress(
  userId: string,
  address: ShippingAddressInput,
): Promise<ShippingAddressView> {
  return customFetch<ShippingAddressView>({
    url: `/users/${encodeURIComponent(userId)}/addresses/shipping`,
    method: 'PUT',
    data: address,
  });
}

export function quoteCheckout(
  dto: CheckoutQuoteDto,
  locale: string,
): Promise<CheckoutQuoteView> {
  return customFetch<CheckoutQuoteView>({
    url: '/checkout/quote',
    method: 'POST',
    params: { locale },
    headers: cartHeaders(),
    data: dto,
  });
}

export function createCheckoutOrder(
  dto: CreateCheckoutOrderDto,
  locale: string,
): Promise<CreateOrderResult> {
  return customFetch<CreateOrderResult>({
    url: '/checkout/create-order',
    method: 'POST',
    params: { locale },
    headers: cartHeaders(),
    data: dto,
  });
}

export function getVnpayReturnState(
  params: Record<string, string>,
): Promise<VnpayReturnState> {
  return customFetch<VnpayReturnState>({
    url: '/payments/vnpay/return',
    method: 'GET',
    params,
  });
}

export function getMyOrders(): Promise<OrderView[]> {
  return customFetch<OrderView[]>({ url: '/orders/my-orders', method: 'GET' });
}

export function getMyOrder(orderNumber: string): Promise<OrderView> {
  return customFetch<OrderView>({
    url: `/me/orders/${encodeURIComponent(orderNumber)}`,
    method: 'GET',
  });
}
