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
import type { OrderStatus } from './status';

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
export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod?: string;
  items: AdminOrderItem[];
  summary: AdminOrderSummary;
  notes?: string | null;
  internalNotes?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id?: string; email?: string; firstName?: string; lastName?: string; phoneNumber?: string } | null;
  shippingAddress?: Record<string, unknown> | null;
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
