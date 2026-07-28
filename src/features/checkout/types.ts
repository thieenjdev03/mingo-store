export type ShippingZone = 'INNER_CITY' | 'OUTER_CITY';
export type FulfillmentType = 'DIRECT' | 'DEALER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type MingoOrderStatus = 'NEW' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';

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

export interface ShippingAddressView extends ShippingAddressInput {
  id: string;
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
    id: string;
    recipient_name: string;
    phone?: string;
    province: string;
    district: string;
    ward?: string;
    street_line_1: string;
    street_line_2?: string;
  };
}

export interface CreateOrderResult {
  orderId: string;
  orderCode: string;
  paymentStatus: PaymentStatus;
  orderStatus: MingoOrderStatus;
  expires_at: string;
  paymentUrl: string;
  summary: OrderSummaryView;
  shipping: ShippingQuoteView;
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
