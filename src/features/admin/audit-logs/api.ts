import { customFetch } from '@/lib/api/fetcher';

/** Tạm thời dùng khi audit endpoint chưa có trong OpenAPI; không sửa output orval. */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLogApiRecord {
  id: string;
  action: AuditAction;
  entity: string;
  entityId?: string | number | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  diff?: Record<string, { old?: unknown; new?: unknown; oldValue?: unknown; newValue?: unknown }> | null;
  userId?: string | null;
  userName?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  method?: string | null;
  path?: string | null;
  createdAt: string;
}

export interface AuditLogApiResponse {
  data?: AuditLogApiRecord[];
  items?: AuditLogApiRecord[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface AuditLogQuery {
  page: number;
  limit: number;
  createdAtFrom?: string;
  createdAtTo?: string;
  entity?: string;
  action?: AuditAction;
  userName?: string;
  entityId?: string;
  sortBy: 'createdAt';
  sortOrder: 'DESC';
}

export function auditLogsKey(params: AuditLogQuery) {
  return ['/audit-logs', params] as const;
}

export async function listAuditLogs(params: AuditLogQuery) {
  const response = await customFetch<AuditLogApiResponse | AuditLogApiRecord[]>({
    url: '/audit-logs',
    method: 'GET',
    params: params as unknown as Record<string, unknown>,
  });

  if (Array.isArray(response)) {
    return { data: response, total: response.length, page: params.page, limit: params.limit, totalPages: 1 };
  }

  const data = response.data ?? response.items ?? [];
  const total = response.total ?? data.length;
  return {
    data,
    total,
    page: response.page ?? params.page,
    limit: response.limit ?? params.limit,
    totalPages: response.totalPages ?? Math.max(1, Math.ceil(total / (response.limit ?? params.limit))),
  };
}
