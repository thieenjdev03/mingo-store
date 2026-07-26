import type { ChangeOrderStatusDtoToStatus } from '@/lib/api/generated/ecomAPI.schemas';

export type OrderStatus = ChangeOrderStatusDtoToStatus;

/** Luồng trạng thái tuyến tính + trạng thái kết thúc (theo backend order-status). */
export const ORDER_FLOW: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'PACKED',
  'READY_TO_GO',
  'AT_CARRIER_FACILITY',
  'IN_TRANSIT',
  'ARRIVED_IN_COUNTRY',
  'AT_LOCAL_FACILITY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  PACKED: 'Đã đóng gói',
  READY_TO_GO: 'Sẵn sàng giao',
  AT_CARRIER_FACILITY: 'Tại kho vận chuyển',
  IN_TRANSIT: 'Đang vận chuyển',
  ARRIVED_IN_COUNTRY: 'Đã đến nước nhận',
  AT_LOCAL_FACILITY: 'Tại kho địa phương',
  OUT_FOR_DELIVERY: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

export function orderStatusTone(status: OrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'DELIVERED') return 'success';
  if (status === 'CANCELLED' || status === 'FAILED') return 'danger';
  if (status === 'REFUNDED') return 'warning';
  if (status === 'PENDING_PAYMENT') return 'neutral';
  return 'info';
}

/** Trạng thái kế tiếp hợp lệ: bước tiếp trong flow + có thể huỷ/hoàn/thất bại (trừ khi đã kết thúc). */
export function nextOrderStatuses(current: OrderStatus): OrderStatus[] {
  const terminal: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'FAILED', 'REFUNDED'];
  if (terminal.includes(current)) return current === 'DELIVERED' ? ['REFUNDED'] : [];
  const idx = ORDER_FLOW.indexOf(current);
  const next = idx >= 0 && idx < ORDER_FLOW.length - 1 ? [ORDER_FLOW[idx + 1]!] : [];
  return [...next, 'CANCELLED', 'FAILED'];
}
