'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

/**
 * Request-level client cache. It deduplicates identical GETs without persisting
 * authenticated payloads to localStorage/IndexedDB.
 */
export function ApiCacheProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 30_000,
        revalidateOnFocus: false,
        shouldRetryOnError: true,
        errorRetryCount: 1,
      }}
    >
      {children}
    </SWRConfig>
  );
}
