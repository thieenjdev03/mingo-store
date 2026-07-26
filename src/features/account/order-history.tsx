'use client';

import { Package, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { fCurrencyVND } from '@/lib/format';

export interface MyOrderItem {
  productName: string;
  productSlug?: string;
  variantName?: string | null;
  quantity: number;
  unitPrice?: string;
  totalPrice?: string;
  productThumbnailUrl?: string | null;
}

export interface MyOrder {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  paymentMethod?: string | null;
  summary?: { total?: string; currency?: string } | null;
  items?: MyOrderItem[];
}

/** OrderStatus enum của backend (src/modules/orders/enums/order-status.enum.ts). */
const KNOWN_STATUSES = new Set([
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
  'CANCELLED',
  'FAILED',
  'REFUNDED',
]);

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: 'bg-blush text-primary',
  PAID: 'bg-green-100 text-green-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-destructive/10 text-destructive',
  FAILED: 'bg-destructive/10 text-destructive',
  REFUNDED: 'bg-muted text-muted-foreground',
};

function statusStyle(status: string): string {
  return STATUS_STYLES[status] ?? 'bg-muted text-foreground';
}

function fallbackStatusLabel(status: string): string {
  const spaced = status.replace(/_/g, ' ').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function OrderHistory({ orders }: { orders: MyOrder[] | null }) {
  const t = useTranslations('account');
  const ts = useTranslations('account.orderStatus');

  const statusLabel = (status: string) => (KNOWN_STATUSES.has(status) ? ts(status) : fallbackStatusLabel(status));

  return (
    <section id="orders" className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2">
        <Package className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-bold">{t('orderHistoryTitle')}</h2>
      </div>

      {orders === null ? (
        <p className="mt-5 text-center text-sm text-muted-foreground">…</p>
      ) : orders.length === 0 ? (
        <div className="mt-5 rounded-lg bg-background px-4 py-8 text-center text-sm text-muted-foreground">
          {t('noData')}
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-border bg-background p-4 sm:p-5">
              {/* Header: mã đơn + ngày + trạng thái */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-foreground">{t('orderNumber', { id: order.orderNumber })}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusStyle(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
              </div>

              {/* Danh sách sản phẩm trong đơn */}
              {order.items && order.items.length > 0 ? (
                <ul className="mt-4 divide-y divide-border border-y border-border">
                  {order.items.map((item, index) => (
                    <li key={`${order.id}-${index}`} className="flex items-center gap-3 py-3">
                      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                        {item.productThumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.productThumbnailUrl}
                            alt={item.productName}
                            className="size-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="size-5 text-muted-foreground" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.variantName ? `${item.variantName} • ` : ''}
                          {t('quantityShort', { count: item.quantity })}
                        </p>
                      </div>
                      {item.totalPrice ? (
                        <span className="shrink-0 text-sm font-semibold text-foreground">
                          {fCurrencyVND(Number(item.totalPrice))}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* Footer: phương thức thanh toán + tổng tiền */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {order.paymentMethod ? t('paidVia', { method: order.paymentMethod }) : ''}
                </span>
                {order.summary?.total ? (
                  <span className="text-base font-bold text-primary">
                    {t('orderTotal')}: {fCurrencyVND(Number(order.summary.total))}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
