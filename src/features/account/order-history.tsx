'use client';

import { Package, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import type { OrderView } from '@/features/checkout/types';

export type MyOrder = OrderView;

const SUCCESS = new Set(['PAID', 'DELIVERED']);
const DANGER = new Set(['FAILED', 'CANCELLED']);

function badgeStyle(status: string): string {
  if (SUCCESS.has(status)) return 'bg-green-100 text-green-700';
  if (DANGER.has(status)) return 'bg-destructive/10 text-destructive';
  return 'bg-blush text-primary';
}

function fallbackLabel(status: string): string {
  const text = status.replaceAll('_', ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function OrderHistory({ orders }: { orders: OrderView[] | null }) {
  const t = useTranslations('account');
  const ts = useTranslations('account.orderStatus');
  const tp = useTranslations('account.paymentStatus');
  const orderLabel = (status: string) => {
    try { return ts(status); } catch { return fallbackLabel(status); }
  };
  const paymentLabel = (status: string) => {
    try { return tp(status); } catch { return fallbackLabel(status); }
  };

  return (
    <section id="orders" className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2">
        <Package className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-bold">{t('orderHistoryTitle')}</h2>
      </div>

      {orders === null ? (
        <p className="mt-5 text-center text-sm text-muted-foreground">…</p>
      ) : orders.length === 0 ? (
        <div className="mt-5 rounded-lg bg-background px-4 py-8 text-center text-sm text-muted-foreground">{t('noData')}</div>
      ) : (
        <ul className="mt-5 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-border bg-background p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/orders/${order.orderNumber}`} className="font-bold text-foreground hover:text-primary">{t('orderNumber', { id: order.orderNumber })}</Link>
                  <p className="mt-0.5 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyle(order.paymentStatus)}`}>{paymentLabel(order.paymentStatus)}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyle(order.status)}`}>{orderLabel(order.status)}</span>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-border border-y border-border">
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.productId}`} className="flex items-center gap-3 py-3">
                    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {item.productThumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.productThumbnailUrl} alt={item.productName} className="size-full object-cover" />
                      ) : <ShoppingBag className="size-5 text-muted-foreground" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{t('quantityShort', { count: item.quantity })}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">{fCurrencyVND(Number(item.totalPrice))}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{order.paymentMethod ? t('paidVia', { method: order.paymentMethod }) : ''}</span>
                <span className="text-base font-bold text-primary">{t('orderTotal')}: {fCurrencyVND(Number(order.summary.total))}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
