'use client';

import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PointsBalanceView } from './types';

interface PointsBalanceCardProps {
  balance: PointsBalanceView | null;
  loading?: boolean;
}

/** TẦNG 3 — thuần trình bày, chỉ nhận PointsBalanceView. */
export function PointsBalanceCard({ balance, loading }: PointsBalanceCardProps) {
  const t = useTranslations('points');

  return (
    <section className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2">
        <Gift className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-bold">{t('title')}</h2>
      </div>

      <div className="mt-5 flex items-end justify-between rounded-xl bg-primary/5 px-5 py-6">
        <span className="text-sm font-medium text-muted-foreground">{t('balanceLabel')}</span>
        <span className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-primary">
            {loading || balance === null ? '—' : balance.balance.toLocaleString('vi-VN')}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">{t('pointsUnit')}</span>
        </span>
      </div>
    </section>
  );
}
