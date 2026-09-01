'use client';

import { useState } from 'react';
import { ChevronDown, Package, ShoppingBag } from 'lucide-react';
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
  const [showAll, setShowAll] = useState(false);
  const visibleOrders = orders ? (showAll ? orders : orders.slice(0, 2)) : [];
  const hasMoreOrders = (orders?.length ?? 0) > 2;
  const orderLabel = (status: string) => {
    try { return ts(status); } catch { return fallbackLabel(status); }
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
        <>
          <ul id="profile-order-history-list" className="mt-5 space-y-4">
            {visibleOrders.map((order) => (
              <li key={order.id} className="rounded-xl border border-border p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/orders/${order.orderNumber}`} className="font-bold text-foreground hover:text-primary">{t('orderNumber', { id: order.orderNumber })}</Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                        <p className="truncate font-sans font-semibold text-foreground">{item.productName}</p>
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

          {hasMoreOrders ? (
            <div className="mt-6 flex justify-center border-t border-border pt-5">
              <button
                type="button"
                aria-expanded={showAll}
                aria-controls="profile-order-history-list"
                onClick={() => setShowAll((current) => !current)}
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-6 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {showAll ? t('collapseOrders') : t('showAllOrders', { count: orders.length })}
                <ChevronDown className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${showAll ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
