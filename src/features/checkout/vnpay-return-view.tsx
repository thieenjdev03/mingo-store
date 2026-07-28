'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { fCurrencyVND } from '@/lib/format';
import { notifyCartUpdated } from '@/features/cart/cart-token';
import { getMyOrder, getVnpayReturnState } from './api';
import type { OrderView, VnpayReturnState } from './types';

export function VnpayReturnView() {
  const t = useTranslations('vnpayReturn');
  const searchParams = useSearchParams();
  const [state, setState] = useState<VnpayReturnState | null>(null);
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    getVnpayReturnState(params)
      .then(async (returnState) => {
        setState(returnState);
        if (!returnState.valid || !returnState.order_number) {
          throw new Error(t('invalidReturn'));
        }
        const freshOrder = await getMyOrder(returnState.order_number);
        setOrder(freshOrder);
        if (freshOrder.paymentStatus === 'PAID') notifyCartUpdated();
      })
      .catch((reason) => {
        setError(reason instanceof Error && reason.message === t('invalidReturn') ? reason.message : getApiErrorMessage(reason, t('loadError')));
      });
  }, [searchParams, t]);

  if (error) return <ReturnShell icon={<XCircle className="size-14 text-destructive" />} title={t('unableTitle')} description={error} />;
  if (!state || !order) return <ReturnShell icon={<Clock3 className="size-14 text-primary" />} title={t('checkingTitle')} description={t('checkingDescription')} />;

  const paid = order.paymentStatus === 'PAID';
  const failed = order.paymentStatus === 'FAILED';
  const icon = paid ? <CheckCircle2 className="size-14 text-green-600" /> : failed ? <XCircle className="size-14 text-destructive" /> : <Clock3 className="size-14 text-primary" />;
  const title = paid ? t('paidTitle') : failed ? t('failedTitle') : t('pendingTitle');
  const description = paid ? t('paidDescription') : failed ? t('failedDescription') : t('pendingDescription');

  return (
    <ReturnShell icon={icon} title={title} description={description}>
      <dl className="mt-6 space-y-3 rounded-lg bg-background p-4 text-sm">
        <div className="flex justify-between gap-4"><dt>{t('orderCode')}</dt><dd className="font-bold">{order.orderNumber}</dd></div>
        <div className="flex justify-between gap-4"><dt>{t('paymentStatus')}</dt><dd className="font-bold">{order.paymentStatus}</dd></div>
        <div className="flex justify-between gap-4"><dt>{t('orderStatus')}</dt><dd className="font-bold">{order.status}</dd></div>
        <div className="flex justify-between gap-4 border-t border-border pt-3"><dt>{t('total')}</dt><dd className="font-bold text-primary">{fCurrencyVND(Number(order.summary.total))}</dd></div>
      </dl>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href={`/orders/${order.orderNumber}`} className="inline-flex h-11 items-center justify-center rounded-lg border-2 border-primary px-5 text-sm font-bold text-primary">{t('viewOrder')}</Link>
        <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground">{t('continueShopping')}</Link>
      </div>
    </ReturnShell>
  );
}

function ReturnShell({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="bg-ivory py-16 sm:py-20">
      <section className="mx-auto max-w-lg rounded-xl bg-card px-6 py-10 text-center shadow-sm sm:px-10">
        <div className="flex justify-center" aria-hidden="true">{icon}</div>
        <h1 className="mt-5 font-display text-3xl font-bold">{title}</h1>
        <p className="mt-3 leading-6 text-muted-foreground">{description}</p>
        {children}
      </section>
    </div>
  );
}
