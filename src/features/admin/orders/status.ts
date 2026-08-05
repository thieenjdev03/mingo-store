import type { ChangeOrderStatusDtoToStatus } from '@/lib/api/generated/ecomAPI.schemas';

export type OrderStatus = ChangeOrderStatusDtoToStatus;

/** Đường đi chính (happy path) — dùng để hiển thị tiến trình đơn hàng theo thứ tự. */
export const ORDER_FLOW: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'PACKED',
  'READY_TO_GO',
  'CONFIRMED',
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
  CONFIRMED: 'Đã xác nhận',
  AT_CARRIER_FACILITY: 'Tại kho vận chuyển',
  IN_TRANSIT: 'Đang vận chuyển',
  ARRIVED_IN_COUNTRY: 'Đã đến nước nhận',
  AT_LOCAL_FACILITY: 'Tại kho nội địa',
  OUT_FOR_DELIVERY: 'Đang giao đến bạn',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  FAILED: 'Giao thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

/**
 * Chuyển trạng thái hợp lệ — mirror ORDER_STATUS_FLOW của backend (orders.service.ts).
 * Giữ đồng bộ với backend để dropdown admin chỉ đề xuất bước server chấp nhận.
 */
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'REFUNDED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['READY_TO_GO'],
  READY_TO_GO: ['CONFIRMED'],
  CONFIRMED: ['AT_CARRIER_FACILITY'],
  AT_CARRIER_FACILITY: ['IN_TRANSIT'],
  IN_TRANSIT: ['ARRIVED_IN_COUNTRY'],
  ARRIVED_IN_COUNTRY: ['AT_LOCAL_FACILITY'],
  AT_LOCAL_FACILITY: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: ['PROCESSING', 'REFUNDED'],
  CANCELLED: ['REFUNDED'],
  REFUNDED: [],
};

/** Thứ tự hiển thị đầy đủ (flow chính + trạng thái ngoại lệ), dùng cho dropdown/filter. */
export const ORDER_STATUS_ORDER: OrderStatus[] = [
  ...ORDER_FLOW,
  'FAILED',
  'CANCELLED',
  'REFUNDED',
];

export function orderStatusTone(status: OrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'DELIVERED') return 'success';
  if (status === 'CANCELLED' || status === 'FAILED') return 'danger';
  if (status === 'REFUNDED') return 'warning';
  if (status === 'PENDING_PAYMENT') return 'neutral';
  return 'info';
}

/** Trạng thái kế tiếp theo flow chuẩn (happy path) — dùng để gợi ý bước tiếp theo, không bắt buộc. */
export function nextOrderStatuses(current: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[current] ?? [];
}

/**
 * Mọi trạng thái admin có thể đặt cho đơn (trừ trạng thái hiện tại).
 * Backend không còn chặn chuyển trạng thái theo flow, nên admin được chọn tự do.
 */
export function selectableOrderStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_ORDER.filter((status) => status !== current);
}
