import type { AuditAction, AuditLogApiRecord } from './api';

export interface AuditDiffView {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditLogView {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  diff: AuditDiffView[];
  userId: string;
  userName: string;
  ip: string | null;
  userAgent: string | null;
  method: string | null;
  path: string | null;
  createdAt: string;
}

export function toAuditLogView(record: AuditLogApiRecord): AuditLogView {
  return {
    id: record.id,
    action: record.action,
    entity: record.entity,
    entityId: record.entityId == null ? '' : String(record.entityId),
    oldValue: record.oldValue ?? null,
    newValue: record.newValue ?? null,
    diff: Object.entries(record.diff ?? {}).map(([field, values]) => ({
      field,
      oldValue: values.oldValue ?? values.old ?? null,
      newValue: values.newValue ?? values.new ?? null,
    })),
    userId: record.userId ?? '',
    userName: record.userName ?? record.userId ?? '',
    ip: record.ip ?? null,
    userAgent: record.userAgent ?? null,
    method: record.method ?? null,
    path: record.path ?? null,
    createdAt: record.createdAt,
  };
}

export function auditActionTone(action: AuditAction): 'success' | 'warning' | 'danger' {
  if (action === 'CREATE') return 'success';
  if (action === 'UPDATE') return 'warning';
  return 'danger';
}
