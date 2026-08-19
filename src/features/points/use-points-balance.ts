'use client';

import { useGetMyPoints } from '@/lib/api/generated/user-points/user-points';
import { toPointsBalanceView } from './types';

/** Container cho balance loyalty: map DTO generated trước khi đưa vào UI. */
export function usePointsBalance(enabled: boolean) {
  const query = useGetMyPoints({ swr: { enabled } });

  return {
    balance: query.data ? toPointsBalanceView(query.data) : null,
    isLoading: query.isLoading,
  };
}
