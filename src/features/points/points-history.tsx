'use client';

import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PointsHistoryView } from './types';

interface PointsHistoryProps {
  history: PointsHistoryView | null;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** TẦNG 3 — thuần trình bày; state phân trang do container giữ, truyền xuống qua props. */
export function PointsHistory({ history, loading, onPrev, onNext }: PointsHistoryProps) {
  const t = useTranslations('points');
  const items = history?.items ?? [];
  const page = history?.page ?? 1;
  const totalPages = history?.totalPages ?? 1;

  return (
    <section className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2">
        <History className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-bold">{t('historyTitle')}</h2>
      </div>

      {loading && history === null ? (
        <p className="mt-5 text-center text-sm text-muted-foreground">{t('loading')}</p>
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-lg bg-background px-4 py-8 text-center text-sm text-muted-foreground">
          {t('noHistory')}
        </div>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {items.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {tx.isEarn ? t('earn') : t('reverse')}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {t('orderRef', { id: tx.orderId.slice(0, 8) })} ·{' '}
                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-base font-bold ${
                    tx.isEarn ? 'text-green-600' : 'text-destructive'
                  }`}
                >
                  {tx.signedPoints > 0 ? '+' : ''}
                  {tx.signedPoints.toLocaleString('vi-VN')} {t('pointsUnit')}
                </span>
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={onPrev}
                disabled={page <= 1 || loading}
                className="inline-flex min-h-10 items-center gap-1 rounded-full border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                {t('prev')}
              </button>
              <span className="text-sm text-muted-foreground">
                {t('page', { page, total: totalPages })}
              </span>
              <button
                type="button"
                onClick={onNext}
                disabled={page >= totalPages || loading}
                className="inline-flex min-h-10 items-center gap-1 rounded-full border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('next')}
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
