'use client';

import { useState } from 'react';
import { useGetMyPointsHistory } from '@/lib/api/generated/user-points/user-points';
import { PointsHistory } from './points-history';
import { toPointsHistoryView } from './types';

const PAGE_SIZE = 10;

interface PointsSectionProps {
  /** JWT bearer; hooks chỉ fetch khi đã đăng nhập (enabled). */
  token: string | null | '';
}

/**
 * TẦNG container cho lịch sử điểm. Balance được hiển thị ở overview tài khoản để
 * người dùng chỉ thấy một nguồn điểm duy nhất.
 */
export function PointsSection({ token }: PointsSectionProps) {
  const [page, setPage] = useState(1);
  const enabled = !!token;

  const historyQuery = useGetMyPointsHistory(
    { page, limit: PAGE_SIZE },
    { swr: { enabled, keepPreviousData: true } },
  );

  const history = historyQuery.data ? toPointsHistoryView(historyQuery.data) : null;

  return (
    <PointsHistory
      history={history}
      loading={historyQuery.isLoading}
      onPrev={() => setPage((p) => Math.max(1, p - 1))}
      onNext={() => setPage((p) => (history ? Math.min(history.totalPages, p + 1) : p + 1))}
    />
  );
}
