'use client';

import { useEffect, useState } from 'react';
import { Package, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { getMyOrder } from '@/features/checkout/api';
import type { OrderView } from '@/features/checkout/types';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';
import { VietQrPanel } from '@/features/checkout/vietqr-panel';

export function OrderDetailView({ orderCode }: { orderCode: string }) {
  const t = useTranslations('orders');
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyOrder(orderCode).then(setOrder).catch((reason) => setError(getApiErrorMessage(reason, t('loadError'))));
  }, [orderCode, t]);

  if (error) return <div className="bg-ivory py-20 text-center text-destructive">{error}</div>;
  if (!order) return <div className="bg-ivory py-20"><MeltingIceCreamLoader label={t('loading')} /></div>;

  const address = order.shippingSnapshot ?? order.shippingAddress;
  // Lỡ luồng QR (đóng tab, hết phiên...) vẫn thanh toán lại được: QR chỉ cần mã đơn + số tiền.
  const awaitingPayment = order.paymentStatus === 'PENDING' || order.paymentStatus === 'FAILED';
  const canPayAgain = awaitingPayment && order.paymentMethod !== 'COD' && order.status !== 'CANCELLED';
  const orderTotal = Number(order.summary.total);
  return (
    <div className="bg-ivory py-12 sm:py-16">
      <div className="mx-auto max-w-[900px] px-5 sm:px-8">
        <Link href="/orders" className="text-sm font-bold text-primary">{t('back')}</Link>
        <div className="mt-5 rounded-xl bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">{t('order')}</p>
              <h1 className="mt-1 font-display text-3xl font-bold">{order.orderNumber}</h1>
            </div>
            <div className="text-right text-sm">
              <p>{t('payment')}: <strong>{order.paymentStatus}</strong></p>
              <p className="mt-1">{t('fulfillment')}: <strong>{order.status}</strong></p>
            </div>
          </div>

          <ul className="mt-7 divide-y divide-border border-y border-border">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-4 py-4">
                <div><p className="font-sans font-semibold">{item.productName}</p><p className="text-sm text-muted-foreground">× {item.quantity}</p></div>
                <p className="font-bold">{fCurrencyVND(Number(item.totalPrice))}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 text-sm">
            <PriceLine label={t('subtotal')} value={order.summary.subtotal} />
            <PriceLine label={t('shipping')} value={order.summary.shipping} />
            <PriceLine label={t('total')} value={order.summary.total} strong />
          </dl>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <section className="rounded-lg bg-background p-4">
              <div className="flex items-center gap-2 font-bold"><Truck className="size-4 text-primary" />{t('delivery')}</div>
              <p className="mt-2 text-sm text-muted-foreground">{order.fulfillmentType === 'DIRECT' ? t('direct') : t('dealer')}</p>
            </section>
            <section className="rounded-lg bg-background p-4">
              <div className="flex items-center gap-2 font-bold"><Package className="size-4 text-primary" />{t('address')}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{formatAddress(address)}</p>
            </section>
          </div>

          {canPayAgain && Number.isFinite(orderTotal) ? (
            <section className="mt-8 border-t border-border pt-7">
              <h2 className="font-display text-2xl font-bold text-foreground">{t('payAgainTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('payAgainDescription')}</p>
              <VietQrPanel orderCode={order.orderNumber} total={orderTotal} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PriceLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 ${strong ? 'border-t border-border pt-3 text-lg font-bold text-primary' : ''}`}><dt>{label}</dt><dd>{fCurrencyVND(Number(value))}</dd></div>;
}

function formatAddress(address: OrderView['shippingSnapshot'] | OrderView['shippingAddress']): string {
  if (!address) return '—';
  if ('address_line' in address) return [address.address_line, address.ward_name, address.district_name, address.province_name].filter(Boolean).join(', ');
  return [address.streetLine1, address.ward, address.district, address.province].filter(Boolean).join(', ');
}
