import type { ChangeOrderStatusDtoToStatus } from '@/lib/api/generated/ecomAPI.schemas';

export type OrderStatus = ChangeOrderStatusDtoToStatus;

/**
 * Flow vận hành chính:
 * thanh toán/xác nhận → đóng gói sẵn sàng → vận chuyển → giao thành công.
 * Các enum chi tiết cũ vẫn được giữ trong map để đọc lịch sử đơn cũ, nhưng không
 * còn là lựa chọn trong flow mới.
 */
export const ORDER_FLOW: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'READY_TO_GO',
  'IN_TRANSIT',
  'DELIVERED',
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán / xác nhận',
  PROCESSING: 'Kho QC / kiểm tra',
  PACKED: 'Đã đóng gói (trạng thái cũ)',
  READY_TO_GO: 'Đã đóng gói & sẵn sàng',
  CONFIRMED: 'Đã xác nhận (trạng thái cũ)',
  AT_CARRIER_FACILITY: 'Tại kho vận chuyển (trạng thái cũ)',
  IN_TRANSIT: 'Đang vận chuyển',
  ARRIVED_IN_COUNTRY: 'Đã đến nước nhận (trạng thái cũ)',
  AT_LOCAL_FACILITY: 'Tại kho nội địa (trạng thái cũ)',
  OUT_FOR_DELIVERY: 'Đang giao đến bạn (trạng thái cũ)',
  DELIVERED: 'Giao thành công',
  CANCELLED: 'Đã hủy',
  FAILED: 'Chuyển hoàn',
  REFUNDED: 'Đã hoàn tiền',
};

/**
 * Chuyển trạng thái theo quy trình vận hành. `FAILED` là chuyến hoàn; sau khi kho
 * QC/kiểm tra (`PROCESSING`), đơn được quay lại bước đóng gói & sẵn sàng.
 */
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['READY_TO_GO', 'CANCELLED'],
  PROCESSING: ['READY_TO_GO'],
  PACKED: ['READY_TO_GO'],
  READY_TO_GO: ['IN_TRANSIT'],
  CONFIRMED: ['READY_TO_GO', 'CANCELLED'],
  AT_CARRIER_FACILITY: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED', 'FAILED'],
  ARRIVED_IN_COUNTRY: ['IN_TRANSIT', 'FAILED'],
  AT_LOCAL_FACILITY: ['IN_TRANSIT', 'FAILED'],
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
  'PROCESSING',
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

/** Chỉ đề xuất bước kế tiếp hợp lệ trong flow đã duyệt. */
export function selectableOrderStatuses(current: OrderStatus): OrderStatus[] {
  return nextOrderStatuses(current);
}
