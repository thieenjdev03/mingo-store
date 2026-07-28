import type { ChangeOrderStatusDtoToStatus } from '@/lib/api/generated/ecomAPI.schemas';

export type OrderStatus = ChangeOrderStatusDtoToStatus;

/** Luồng trạng thái tuyến tính (theo backend ORDER_STATUS_FLOW). */
export const ORDER_FLOW: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'CONFIRMED',
  'PACKED',
  'IN_TRANSIT',
  'DELIVERED',
];

/** Trạng thái kết thúc — không đi tiếp trong flow tuyến tính. */
const TERMINAL: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'FAILED', 'REFUNDED'];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  CONFIRMED: 'Đã xác nhận đơn hàng',
  PACKED: 'Đã đóng gói và sẵn sàng giao hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

/** Thứ tự hiển thị đầy đủ (flow + trạng thái kết thúc), dùng cho dropdown/filter. */
export const ORDER_STATUS_ORDER: OrderStatus[] = [
  ...ORDER_FLOW,
  'CANCELLED',
  'FAILED',
  'REFUNDED',
];

export function orderStatusTone(status: OrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'DELIVERED') return 'success';
  if (status === 'CANCELLED' || status === 'FAILED') return 'danger';
  if (status === 'REFUNDED') return 'warning';
  if (status === 'PENDING_PAYMENT') return 'neutral';
  return 'info';
}

/** Trạng thái kế tiếp hợp lệ: bước tiếp trong flow + có thể huỷ/thất bại (trừ khi đã kết thúc). */
export function nextOrderStatuses(current: OrderStatus): OrderStatus[] {
  if (TERMINAL.includes(current)) {
    return current === 'REFUNDED' ? [] : ['REFUNDED'];
  }
  const idx = ORDER_FLOW.indexOf(current);
  const next = idx >= 0 && idx < ORDER_FLOW.length - 1 ? [ORDER_FLOW[idx + 1]!] : [];
  return [...next, 'CANCELLED', 'FAILED'];
}
