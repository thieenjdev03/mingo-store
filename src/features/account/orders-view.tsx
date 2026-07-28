'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getAccessToken } from '@/lib/auth/token';
import { getMyOrders } from '@/features/checkout/api';
import type { OrderView } from '@/features/checkout/types';
import { OrderHistory } from './order-history';

export function OrdersView() {
  const t = useTranslations('account');
  const [orders, setOrders] = useState<OrderView[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const hasToken = Boolean(getAccessToken());
    setSignedIn(hasToken);
    if (!hasToken) return;
    getMyOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  if (signedIn === null) return <div className="bg-ivory py-20 text-center text-muted-foreground">…</div>;
  if (!signedIn) {
    return (
      <div className="bg-ivory py-20 text-center">
        <h1 className="font-display text-4xl font-bold">{t('orders')}</h1>
        <p className="mt-3 text-muted-foreground">{t('signInPrompt')}</p>
        <Link href="/login" className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground">{t('signIn')}</Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory py-12 sm:py-16">
      <div className="mx-auto max-w-[1000px] px-5 sm:px-8">
        <OrderHistory orders={orders} />
      </div>
    </div>
  );
}
