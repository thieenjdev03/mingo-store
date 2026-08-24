'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Dialog } from '@/components/admin/ui/dialog';
import type { AuditLogView } from './types';
import { auditActionTone } from './types';

interface AuditLogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLogView | null;
}

const FIELD_LABEL_KEYS: Record<string, string> = {
  basePrice: 'fields.basePrice',
  salePrice: 'fields.salePrice',
  variantIds: 'fields.variantIds',
  productName: 'fields.productName',
  status: 'fields.status',
};

function displayValue(value: unknown, emptyLabel: string): string {
  if (value == null || value === '') return emptyLabel;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function CopyButton({ value, label }: { value: unknown; label: string }) {
  const t = useTranslations('admin.auditLog');
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      onClick={async () => {
        await navigator.clipboard.writeText(JSON.stringify(value ?? null, null, 2));
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? t('copied') : t('copy')}
    </Button>
  );
}

function Snapshot({ value, title, copyLabel }: { value: Record<string, unknown> | null; title: string; copyLabel: string }) {
  const t = useTranslations('admin.auditLog');
  const entries = Object.entries(value ?? {});

  return (
    <section className="rounded-md border border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <CopyButton value={value} label={copyLabel} />
      </div>
      <div className="max-h-80 overflow-auto p-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('emptyValue')}</p>
        ) : (
          <dl className="divide-y divide-border">
            {entries.map(([key, entry]) => (
              <div key={key} className="grid gap-1 py-2 sm:grid-cols-[minmax(120px,0.35fr)_1fr]">
                <dt className="break-words text-sm font-medium text-muted-foreground">{key}</dt>
                <dd className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                  {displayValue(entry, t('emptyValue'))}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

export function AuditLogDetailDialog({ open, onOpenChange, log }: AuditLogDetailDialogProps) {
  const t = useTranslations('admin.auditLog');
  if (!log) return null;

  const date = new Date(log.createdAt);
  const timestamp = Number.isNaN(date.getTime()) ? log.createdAt : date.toLocaleString('vi-VN');
  const actionLabel = t(`actions.${log.action}`);
  const fieldLabel = (field: string) => (FIELD_LABEL_KEYS[field] ? t(FIELD_LABEL_KEYS[field]) : field);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('detail.title')} className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={auditActionTone(log.action)}>{actionLabel}</Badge>
        <span className="font-semibold">{log.entity}</span>
        {log.entityId ? <span className="font-mono text-sm text-muted-foreground">#{log.entityId}</span> : null}
        <span className="text-sm text-muted-foreground">{timestamp}</span>
      </div>
      <dl className="mt-4 grid gap-3 rounded-md bg-muted/50 p-4 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">{t('actor')}</dt><dd className="break-words font-medium">{log.userName || log.userId || t('emptyValue')}</dd></div>
        <div><dt className="text-muted-foreground">{t('entityId')}</dt><dd className="break-words font-mono">{log.entityId || t('emptyValue')}</dd></div>
      </dl>

      <details className="mt-4 rounded-md border border-border p-4">
        <summary className="cursor-pointer text-sm font-semibold">{t('metadata')}</summary>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          {([['ip', log.ip], ['userAgent', log.userAgent], ['method', log.method], ['path', log.path]] as const).map(([key, value]) => (
            <div key={key} className="min-w-0">
              <dt className="text-muted-foreground">{t(`metadataFields.${key}`)}</dt>
              <dd className="break-words font-mono text-xs">{value || t('emptyValue')}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="mt-5 space-y-4">
        {log.action === 'UPDATE' ? (
          <section className="overflow-hidden rounded-md border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-muted text-left text-muted-foreground">
                  <tr><th className="px-4 py-3">{t('field')}</th><th className="px-4 py-3">{t('oldValue')}</th><th className="px-4 py-3">{t('newValue')}</th></tr>
                </thead>
                <tbody>
                  {log.diff.map((change) => (
                    <tr key={change.field} className="border-t border-border align-top">
                      <th className="px-4 py-3 text-left font-medium">{fieldLabel(change.field)}</th>
                      <td className="whitespace-pre-wrap break-words bg-red-50 px-4 py-3 font-mono text-xs">{displayValue(change.oldValue, t('emptyValue'))}</td>
                      <td className="whitespace-pre-wrap break-words bg-green-50 px-4 py-3 font-mono text-xs">{displayValue(change.newValue, t('emptyValue'))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : log.action === 'DELETE' ? (
          <>
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{t('deletedWarning')}</p>
            <Snapshot value={log.oldValue} title={t('oldValue')} copyLabel={t('copyOldValue')} />
          </>
        ) : (
          <Snapshot value={log.newValue} title={t('newValue')} copyLabel={t('copyNewValue')} />
        )}
      </div>
    </Dialog>
  );
}
