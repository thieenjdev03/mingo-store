import { customFetch } from '@/lib/api/fetcher';
import { getOrCreateCartToken } from '@/features/cart/cart-token';
import type {
  CheckoutPaymentMethod,
  CheckoutQuoteView,
  CheckoutRequestInput,
  CreateOrderResult,
  OrderView,
  ShippingAddressInput,
  SavedShippingAddress,
  ShippingAddressView,
  ShippingQuoteDto,
  ShippingQuoteView,
  VnpayReturnState,
} from './types';

/**
 * DTO body cho các endpoint `/checkout/*` và địa chỉ giao hàng. Các endpoint này ra đời
 * sau lần `api:gen` gần nhất nên KHÔNG có trong generated schemas — hand-type ở đây theo đúng
 * convention "consumed hand-typed via customFetch" (xem CLAUDE.md). Field snake_case khớp backend.
 */
interface CheckoutShippingAddressDto {
  recipient_name: string;
  recipient_phone: string;
  province: string;
  district: string;
  ward?: string;
  street_line_1: string;
}

interface CreateCheckoutOrderDto {
  shipping_address_id?: string;
  shipping_address?: CheckoutShippingAddressDto;
  province_code?: string;
  district_code?: string;
  notes?: string;
}

type CheckoutQuoteDto = CreateCheckoutOrderDto;

interface CheckoutOrderDtoWithOptions extends CreateCheckoutOrderDto {
  payment_method: CheckoutPaymentMethod;
}

function cartHeaders(): Record<string, string> {
  return { 'X-Cart-Token': getOrCreateCartToken() };
}

function toCheckoutAddress(address: ShippingAddressInput): CheckoutShippingAddressDto {
  return {
    recipient_name: address.recipientName,
    recipient_phone: address.recipientPhone,
    province: address.province,
    district: address.district,
    ward: address.ward,
    street_line_1: address.streetLine1,
  };
}

function toCheckoutDto(input: CheckoutRequestInput): CreateCheckoutOrderDto {
  return {
    shipping_address_id: input.shippingAddressId,
    shipping_address: input.shippingAddress ? toCheckoutAddress(input.shippingAddress) : undefined,
    province_code: input.provinceCode,
    district_code: input.districtCode,
    notes: input.notes,
  };
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

/** Danh sách địa chỉ hiện có của tài khoản, luôn lấy mới khi vào checkout. */
export function getShippingAddresses(userId: string): Promise<SavedShippingAddress[]> {
  return customFetch<SavedShippingAddress[]>({
    url: `/users/${encodeURIComponent(userId)}/addresses`,
    method: 'GET',
    cache: 'no-store',
  });
}

export function quoteCheckout(
  input: CheckoutRequestInput,
  locale: string,
): Promise<CheckoutQuoteView> {
  const dto: CheckoutQuoteDto = toCheckoutDto(input);
  return customFetch<CheckoutQuoteView>({
    url: '/checkout/quote',
    method: 'POST',
    params: { locale },
    headers: cartHeaders(),
    data: dto,
  });
}

export function createCheckoutOrder(
  input: CheckoutRequestInput,
  locale: string,
): Promise<CreateOrderResult> {
  const dto: CheckoutOrderDtoWithOptions = {
    ...toCheckoutDto(input),
    payment_method: input.paymentMethod,
  };
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

export function getCheckoutOrder(orderNumber: string): Promise<OrderView> {
  return customFetch<OrderView>({
    url: `/checkout/orders/${encodeURIComponent(orderNumber)}`,
    method: 'GET',
    headers: cartHeaders(),
  });
}
