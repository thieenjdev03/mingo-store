/**
 * Data-layer admin cho Đơn hàng (/orders). Response chưa được document (unknown) nên tier-2 tự
 * khai báo AdminOrder theo entity backend (order.entity.ts). List admin: GET /orders?status&userId.
 */
import {
  ordersControllerFindAll,
  ordersControllerFindOne,
  ordersControllerUpdate,
  ordersControllerChangeStatus,
  ordersControllerRemove,
} from '@/lib/api/generated/orders/orders';
import type { UpdateOrderDto, ChangeOrderStatusDto } from '@/lib/api/generated/ecomAPI.schemas';
import { ORDER_STATUS_LABEL, type OrderStatus } from './status';

export interface AdminOrderItem {
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sku?: string;
}
export interface AdminOrderSummary {
  subtotal: string;
  shipping: string;
  tax: string;
  discount: string;
  total: string;
  currency: string;
}
/** Trạng thái thanh toán — tách hẳn khỏi trạng thái đơn (xem status.ts). */
export type AdminPaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface AdminOrderAddress {
  recipientName?: string | null;
  recipientPhone?: string | null;
  streetLine1?: string | null;
  streetLine2?: string | null;
  ward?: string | null;
  district?: string | null;
  province?: string | null;
  countryCode?: string | null;
  note?: string | null;
}

export interface AdminOrderTrackingEntry {
  from_status?: string | null;
  to_status?: string | null;
  note?: string | null;
  changed_at?: string | null;
  changedAt?: string | null;
  at?: string | null;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod?: string | null;
  paymentStatus?: AdminPaymentStatus | null;
  paidAt?: string | null;
  vnpayTxnRef?: string | null;
  vnpayTransactionNo?: string | null;
  /** Tồn kho đã giữ chỗ cho đơn chưa — quan trọng với đơn chờ thanh toán. */
  stockReserved?: boolean | null;
  reservationExpiresAt?: string | null;
  tracking_history?: AdminOrderTrackingEntry[] | null;
  items: AdminOrderItem[];
  summary: AdminOrderSummary;
  notes?: string | null;
  internalNotes?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id?: string; email?: string; firstName?: string; lastName?: string; phoneNumber?: string } | null;
  shippingAddress?: AdminOrderAddress | null;
}

export const PAYMENT_STATUS_LABEL: Record<AdminPaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
};

export function paymentStatusTone(status?: AdminPaymentStatus | null): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'PAID') return 'success';
  if (status === 'FAILED') return 'danger';
  if (status === 'PENDING') return 'warning';
  return 'neutral';
}

/**
 * Địa chỉ một dòng. Backend đang có data trùng (province/district/ward cùng giá trị,
 * vd "Phường Sài Gòn" lặp 2 lần) nên phải khử trùng trước khi nối.
 */
export function formatOrderAddress(address?: AdminOrderAddress | null): string {
  if (!address) return '';
  const parts = [address.streetLine1, address.streetLine2, address.ward, address.district, address.province]
    .map((part) => part?.trim())
    .filter((part): part is string => !!part);
  return Array.from(new Set(parts)).join(', ');
}

/**
 * `notes` của đơn checkout đang bị nhồi lại chính địa chỉ giao hàng
 * ("Shipping Address: Tên, SĐT, …") — đã có block địa chỉ có cấu trúc rồi nên
 * ghi chú kiểu này là nhiễu, ẩn đi.
 */
export function isRedundantOrderNote(notes?: string | null): boolean {
  return !!notes && /^\s*shipping address\s*:/i.test(notes);
}

/** Backend từng trả cả snake_case lẫn camelCase ở các endpoint đơn hàng. */
export function getTrackingChangedAt(entry: AdminOrderTrackingEntry): string | null {
  return entry.changed_at ?? entry.changedAt ?? entry.at ?? null;
}

/** Luôn hiển thị dd/MM/yyyy và giờ 24h theo múi giờ vận hành tại Việt Nam. */
export function formatOrderDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).reduce<Record<string, string>>((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});

  return `${parts.day ?? '—'}/${parts.month ?? '—'}/${parts.year ?? '—'} · ${parts.hour ?? '—'}:${parts.minute ?? '—'}:${parts.second ?? '—'}`;
}

/** Timeline mới nhất trước; nếu timestamp thiếu thì giữ thứ tự response để không làm sai lịch sử. */
export function sortTrackingHistory(entries?: AdminOrderTrackingEntry[] | null): AdminOrderTrackingEntry[] {
  return [...(entries ?? [])].sort((left, right) => {
    const leftAt = getTrackingChangedAt(left);
    const rightAt = getTrackingChangedAt(right);
    const leftTime = leftAt ? Date.parse(leftAt) : Number.NaN;
    const rightTime = rightAt ? Date.parse(rightAt) : Number.NaN;
    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0;
    return rightTime - leftTime;
  });
}

export function getLatestTrackingStatus(
  entries: AdminOrderTrackingEntry[] | null | undefined,
  fallback: OrderStatus,
): OrderStatus {
  const latest = sortTrackingHistory(entries).find((entry) => {
    const status = entry.to_status;
    return typeof status === 'string' && status in ORDER_STATUS_LABEL;
  });
  return (latest?.to_status as OrderStatus | undefined) ?? fallback;
}

export interface OrdersFilter {
  status?: string;
  userId?: string;
}

export function ordersKey(params: OrdersFilter) {
  return ['/orders', params] as const;
}

export async function listOrders(params: OrdersFilter): Promise<AdminOrder[]> {
  const res = (await ordersControllerFindAll(params)) as unknown as
    | AdminOrder[]
    | { data?: AdminOrder[]; items?: AdminOrder[] }
    | undefined;
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.items ?? [];
}

export async function getOrder(id: string): Promise<AdminOrder> {
  return (await ordersControllerFindOne(id)) as unknown as AdminOrder;
}

export function updateOrder(id: string, dto: UpdateOrderDto) {
  return ordersControllerUpdate(id, dto);
}
export function changeOrderStatus(id: string, dto: ChangeOrderStatusDto) {
  return ordersControllerChangeStatus(id, dto);
}
export function deleteOrder(id: string) {
  return ordersControllerRemove(id);
}
