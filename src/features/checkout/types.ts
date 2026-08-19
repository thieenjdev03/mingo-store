/**
 * TẦNG 1 (khai báo tay) — backend chưa có module /checkout, /shipping/quote nên các DTO
 * đầu vào này chưa có trong `@/lib/api/generated`. Frontend chạy trước backend.
 */
export interface ShippingQuoteDto {
  province_code: string;
  district_code: string;
}

export interface CheckoutQuoteDto {
  shipping_address_id: string;
  province_code: string;
  district_code: string;
}

export interface CreateCheckoutOrderDto {
  shipping_address_id: string;
  province_code: string;
  district_code: string;
  notes?: string;
}

export type ShippingZone = 'INNER_CITY' | 'OUTER_CITY';
export type FulfillmentType = 'DIRECT' | 'DEALER';
export type PaymentStatus = 'PENDING' | 'PENDING_MANUAL_APPROVAL' | 'PAID' | 'FAILED';
export type MingoOrderStatus = 'NEW' | 'PENDING_PAYMENT' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
export type CheckoutPaymentMethod = 'COD' | 'VIETQR';

export interface DealerView {
  id: string;
  name: string;
  slug: string;
  province_code: string;
}

export interface ShippingQuoteView {
  serviceable: boolean;
  shipping_zone: ShippingZone;
  shipping_fee: number;
  currency: 'VND';
  fulfillment_type: FulfillmentType;
  dealer: DealerView | null;
  reason?: string;
}

export interface ShippingAddressInput {
  recipientName: string;
  recipientPhone: string;
  label: string;
  countryCode: 'VN';
  province: string;
  district: string;
  ward?: string;
  streetLine1: string;
  note?: string;
  isShipping: true;
  isDefault: true;
}

/** Địa chỉ giao hàng đã lưu từ API `/users/:userId/addresses`. */
export interface SavedShippingAddress {
  id: string;
  recipientName: string;
  recipientPhone: string | null;
  countryCode: string;
  provinceId: string;
  province: string;
  district: string;
  wardId: string;
  ward: string | null;
  streetLine1: string;
  label: string;
  isShipping: boolean;
  isDefault: boolean;
}

export interface ShippingAddressView extends ShippingAddressInput {
  id: string;
}

export interface CheckoutRequestInput {
  shippingAddressId?: string;
  shippingAddress?: ShippingAddressInput;
  provinceCode: string;
  districtCode: string;
  notes?: string;
  paymentMethod: CheckoutPaymentMethod;
}

export interface OrderItemView {
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sku?: string;
  productThumbnailUrl?: string;
  weightGrams?: number | null;
}

export interface OrderSummaryView {
  subtotal: string;
  shipping: string;
  tax: string;
  discount: string;
  total: string;
  currency: 'VND';
}

export interface CheckoutQuoteView {
  items: OrderItemView[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingZone: ShippingZone;
  fulfillmentType: FulfillmentType;
  dealer: DealerView | null;
  serviceable: boolean;
  summary: OrderSummaryView;
  shipping: ShippingQuoteView;
  address: {
    id: string | null;
    recipient_name: string;
    phone?: string;
    email?: string;
    province: string;
    district: string;
    ward?: string;
    street_line_1: string;
    street_line_2?: string;
  };
}

/** TẦNG 1 — response hiện tại của `/checkout/create-order`. */
export interface CreateCheckoutOrderResponseDto {
  order: {
    id: string;
    orderNumber: string;
    status: MingoOrderStatus | string;
    paymentMethod: CheckoutPaymentMethod | string;
    summary: OrderSummaryView;
  };
  payment: {
    method: CheckoutPaymentMethod | string;
    status: PaymentStatus | string;
  };
}

/** TẦNG 2 — dữ liệu đơn tối thiểu để điều hướng UI sau khi tạo đơn. */
export interface CreateOrderResult {
  orderId: string;
  orderCode: string;
  paymentMethod: CheckoutPaymentMethod | string;
  paymentStatus: PaymentStatus | string;
  orderStatus: MingoOrderStatus | string;
  summary: OrderSummaryView;
}

export function toCreateOrderResult(response: CreateCheckoutOrderResponseDto): CreateOrderResult {
  return {
    orderId: response.order.id,
    orderCode: response.order.orderNumber,
    paymentMethod: response.payment.method,
    paymentStatus: response.payment.status,
    orderStatus: response.order.status,
    summary: response.order.summary,
  };
}

export interface OrderView {
  id: string;
  orderNumber: string;
  status: MingoOrderStatus | string;
  paymentStatus: PaymentStatus | string;
  paymentMethod?: string | null;
  items: OrderItemView[];
  summary: OrderSummaryView;
  shippingZone?: ShippingZone | null;
  fulfillmentType?: FulfillmentType | null;
  shippingSnapshot?: {
    receiver_name: string;
    phone: string;
    address_line: string;
    province_name?: string;
    district_name?: string;
    ward_name?: string;
  } | null;
  shippingAddress?: {
    recipientName?: string;
    recipientPhone?: string;
    province?: string;
    district?: string;
    ward?: string;
    streetLine1?: string;
  } | null;
  createdAt: string;
}

export interface VnpayReturnState {
  valid: boolean;
  order_number: string | null;
  payment_status: PaymentStatus | null;
  order_status: MingoOrderStatus | null;
}
