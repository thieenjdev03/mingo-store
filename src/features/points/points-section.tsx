'use client';

import { useState } from 'react';
import { useGetMyPoints, useGetMyPointsHistory } from '@/lib/api/generated/user-points/user-points';
import { PointsBalanceCard } from './points-balance-card';
import { PointsHistory } from './points-history';
import { toPointsBalanceView, toPointsHistoryView } from './types';

const PAGE_SIZE = 10;

interface PointsSectionProps {
  /** JWT bearer; hooks chỉ fetch khi đã đăng nhập (enabled). */
  token: string | null | '';
}

/**
 * TẦNG container: gọi SWR hooks generated -> map sang view model -> truyền props
 * đã gõ kiểu xuống component trình bày. Fetch được gate bằng `enabled` để không
 * bắn request khi chưa có token.
 */
export function PointsSection({ token }: PointsSectionProps) {
  const [page, setPage] = useState(1);
  const enabled = !!token;

  const balanceQuery = useGetMyPoints({ swr: { enabled } });
  const historyQuery = useGetMyPointsHistory(
    { page, limit: PAGE_SIZE },
    { swr: { enabled, keepPreviousData: true } },
  );

  const balance = balanceQuery.data ? toPointsBalanceView(balanceQuery.data) : null;
  const history = historyQuery.data ? toPointsHistoryView(historyQuery.data) : null;

  return (
    <div className="flex flex-col gap-5">
      <PointsBalanceCard balance={balance} loading={balanceQuery.isLoading} />
      <PointsHistory
        history={history}
        loading={historyQuery.isLoading}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => (history ? Math.min(history.totalPages, p + 1) : p + 1))}
      />
    </div>
  );
}
