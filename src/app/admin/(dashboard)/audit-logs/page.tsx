'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Eye, RotateCcw, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Badge } from '@/components/admin/ui/badge';
import { Pagination } from '@/components/admin/ui/pagination';
import { auditLogsKey, listAuditLogs, type AuditAction, type AuditLogQuery } from '@/features/admin/audit-logs/api';
import { auditActionTone, toAuditLogView, type AuditLogView } from '@/features/admin/audit-logs/types';
import { AuditLogDetailDialog } from '@/features/admin/audit-logs/audit-log-detail-dialog';

const LIMIT = 20;
const ENTITY_OPTIONS = ['Product', 'Order', 'Category', 'User', 'Collection', 'Brand', 'Size', 'Career', 'Policy', 'HomepageBanner', 'Distributor'];

interface AuditFilters {
  createdAtFrom: string;
  createdAtTo: string;
  entity: string;
  action: '' | AuditAction;
  userName: string;
  entityId: string;
  page: number;
}

function readFilters(params: URLSearchParams): AuditFilters {
  const page = Number(params.get('page'));
  const action = params.get('action');
  return {
    createdAtFrom: params.get('createdAtFrom') ?? '',
    createdAtTo: params.get('createdAtTo') ?? '',
    entity: params.get('entity') ?? '',
    action: action === 'CREATE' || action === 'UPDATE' || action === 'DELETE' ? action : '',
    userName: params.get('userName') ?? '',
    entityId: params.get('entityId') ?? '',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function AdminAuditLogsPage() {
  const t = useTranslations('admin.auditLog');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<AuditFilters>(() => readFilters(new URLSearchParams(searchParams.toString())));
  const [selected, setSelected] = useState<AuditLogView | null>(null);
  const debouncedUserName = useDebouncedValue(filters.userName, 350);
  const debouncedEntityId = useDebouncedValue(filters.entityId, 350);

  const params = useMemo<AuditLogQuery>(() => ({
    page: filters.page,
    limit: LIMIT,
    createdAtFrom: filters.createdAtFrom || undefined,
    createdAtTo: filters.createdAtTo || undefined,
    entity: filters.entity || undefined,
    action: filters.action || undefined,
    userName: debouncedUserName.trim() || undefined,
    entityId: debouncedEntityId.trim() || undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  }), [debouncedEntityId, debouncedUserName, filters]);

  useEffect(() => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, userName: debouncedUserName, entityId: debouncedEntityId })) {
      if (value && value !== 1) query.set(key, String(value));
    }
    const nextUrl = query.size ? `${pathname}?${query.toString()}` : pathname;
    if (nextUrl !== `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [debouncedEntityId, debouncedUserName, filters, pathname, router, searchParams]);

  const { data, error, isLoading, mutate } = useSWR(auditLogsKey(params), () => listAuditLogs(params), { keepPreviousData: true });
  const rows = useMemo(() => (data?.data ?? []).map(toAuditLogView), [data]);
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil((data?.total ?? 0) / LIMIT));
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', { dateStyle: 'medium', timeStyle: 'short' }), [locale]);

  const updateFilter = <K extends keyof AuditFilters>(key: K, value: AuditFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value, ...(key === 'page' ? {} : { page: 1 }) }));
  };

  const clearFilters = () => setFilters({ createdAtFrom: '', createdAtTo: '', entity: '', action: '', userName: '', entityId: '', page: 1 });
  const hasFilters = Object.entries(filters).some(([key, value]) => key !== 'page' && Boolean(value));

  const columns: Column<AuditLogView>[] = [
    {
      key: 'createdAt', header: t('time'), render: (log) => {
        const date = new Date(log.createdAt);
        const full = Number.isNaN(date.getTime()) ? log.createdAt : date.toISOString();
        return <time dateTime={full} title={full}>{Number.isNaN(date.getTime()) ? log.createdAt : dateFormatter.format(date)}</time>;
      },
    },
    { key: 'userName', header: t('actor'), render: (log) => <span className="break-words">{log.userName || log.userId || t('emptyValue')}</span> },
    { key: 'action', header: t('action'), align: 'center', render: (log) => <Badge tone={auditActionTone(log.action)}>{t(`actions.${log.action}`)}</Badge> },
    { key: 'entity', header: t('module'), render: (log) => <span className="font-medium">{log.entity}</span> },
    { key: 'entityId', header: t('entityId'), render: (log) => <span className="font-mono text-xs">{log.entityId || t('emptyValue')}</span> },
    {
      key: 'summary', header: t('summary'), render: (log) => log.action === 'UPDATE' ? t('fieldsChanged', { count: log.diff.length }) : t(`summaries.${log.action}`),
    },
    {
      key: 'actions', header: '', align: 'right', render: (log) => <Button variant="ghost" size="icon" aria-label={t('details')} onClick={() => setSelected(log)}><Eye className="size-4" /></Button>,
    },
  ];

  return (
    <div>
      <PageHeader title={t('title')} description={t('description')} />
      <div className="mb-4 rounded-lg border border-border bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm"><span className="mb-1 block text-muted-foreground">{t('from')}</span><Input type="date" value={filters.createdAtFrom} onChange={(e) => updateFilter('createdAtFrom', e.target.value)} /></label>
          <label className="text-sm"><span className="mb-1 block text-muted-foreground">{t('to')}</span><Input type="date" value={filters.createdAtTo} onChange={(e) => updateFilter('createdAtTo', e.target.value)} /></label>
          <label className="text-sm"><span className="mb-1 block text-muted-foreground">{t('module')}</span><NativeSelect value={filters.entity} onChange={(e) => updateFilter('entity', e.target.value)}><option value="">{t('allEntities')}</option>{ENTITY_OPTIONS.map((entity) => <option key={entity} value={entity}>{t.has(`entities.${entity}`) ? t(`entities.${entity}`) : entity}</option>)}</NativeSelect></label>
          <label className="text-sm"><span className="mb-1 block text-muted-foreground">{t('action')}</span><NativeSelect value={filters.action} onChange={(e) => updateFilter('action', e.target.value as AuditFilters['action'])}><option value="">{t('allActions')}</option><option value="CREATE">{t('actions.CREATE')}</option><option value="UPDATE">{t('actions.UPDATE')}</option><option value="DELETE">{t('actions.DELETE')}</option></NativeSelect></label>
          <label className="text-sm sm:col-span-2"><span className="mb-1 block text-muted-foreground">{t('actor')}</span><Input value={filters.userName} placeholder={t('searchActor')} onChange={(e) => updateFilter('userName', e.target.value)} /></label>
          <label className="text-sm sm:col-span-2"><span className="mb-1 block text-muted-foreground">{t('entityId')}</span><Input value={filters.entityId} placeholder={t('searchEntityId')} onChange={(e) => updateFilter('entityId', e.target.value)} /></label>
        </div>
        {hasFilters ? <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={clearFilters}><X className="size-4" />{t('clearFilters')}</Button> : null}
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(log) => log.id} loading={isLoading} error={error ? t('loadError') : null} onRetry={() => mutate()} retryLabel={t('retry')} emptyMessage={hasFilters ? t('noMatches') : t('noRecords')} />
      <Pagination page={filters.page} totalPages={totalPages} total={data?.total} onPageChange={(page) => updateFilter('page', page)} />
      {data && filters.page > totalPages ? <Button type="button" variant="outline" className="mt-3" onClick={() => updateFilter('page', 1)}><RotateCcw className="size-4" />{t('backToFirstPage')}</Button> : null}
      <AuditLogDetailDialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)} log={selected} />
    </div>
  );
}
