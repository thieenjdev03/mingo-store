'use client';

import { useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { FileText } from 'lucide-react';
import type {
  CareerApplicationListItemDto,
  CareerApplicationListItemDtoStatus,
  CareerApplicationsControllerFindAllStatus,
} from '@/lib/api/generated/ecomAPI.schemas';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { useToast } from '@/components/admin/ui/toast';
import {
  careersKey,
  listCareers,
  listAllApplications,
  updateApplicationStatus,
} from '@/features/admin/careers/api';
import { ApplicationDetailDialog } from '@/features/admin/careers/application-detail-dialog';
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL } from '@/features/admin/careers/status';

const PAGE_SIZE = 20;

export default function AdminCareerApplicationsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | CareerApplicationsControllerFindAllStatus>('');
  const [careerId, setCareerId] = useState('');
  const [detail, setDetail] = useState<CareerApplicationListItemDto | null>(null);

  // Danh sách tin tuyển dụng chỉ để đổ vào bộ lọc "Vị trí".
  const careersParams = { limit: 100 };
  const { data: careersData } = useSWR(careersKey(careersParams), () => listCareers(careersParams));

  const filters = {
    search: search.trim() || undefined,
    status: status || undefined,
    career_id: careerId || undefined,
  };

  const { data, isLoading, error, size, setSize, mutate } = useSWRInfinite(
    (index, previous: Awaited<ReturnType<typeof listAllApplications>> | null) => {
      if (previous && !previous.nextCursor) return null;
      return ['/career-applications', filters, previous?.nextCursor ?? null] as const;
    },
    ([, params, cursor]) =>
      listAllApplications({ ...params, limit: PAGE_SIZE, cursor: cursor ?? undefined }),
  );

  const rows = data?.flatMap((page) => page.items) ?? [];
  const hasMore = !!data?.[data.length - 1]?.nextCursor;
  const loadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');

  const onStatusChange = async (app: CareerApplicationListItemDto, next: CareerApplicationListItemDtoStatus) => {
    try {
      await updateApplicationStatus(app.id, { status: next });
      toast({ title: 'Đã cập nhật trạng thái', tone: 'success' });
      mutate();
    } catch {
      toast({ title: 'Cập nhật thất bại', tone: 'error' });
    }
  };

  const columns: Column<CareerApplicationListItemDto>[] = [
    {
      key: 'applicant',
      header: 'Ứng viên',
      render: (a) => (
        <div className="min-w-0">
          <button onClick={() => setDetail(a)} className="font-semibold text-foreground hover:text-primary">
            {a.full_name}
          </button>
          <p className="text-xs text-muted-foreground">{a.email} · {a.phone}</p>
        </div>
      ),
    },
    { key: 'career_title', header: 'Vị trí', render: (a) => a.career_title },
    {
      key: 'created_at',
      header: 'Ngày nộp',
      render: (a) => new Date(a.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (a) => (
        <NativeSelect
          value={a.status}
          onChange={(e) => onStatusChange(a, e.target.value as CareerApplicationListItemDtoStatus)}
          className="w-36"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>
          ))}
        </NativeSelect>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) => (
        <a
          href={a.cv_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <FileText className="size-4" /> CV
        </a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Đơn ứng tuyển" description="Hồ sơ ứng viên gửi từ trang nghề nghiệp." />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Tìm theo tên hoặc email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="max-w-[180px]">
          <option value="">Tất cả trạng thái</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>
          ))}
        </NativeSelect>
        <NativeSelect value={careerId} onChange={(e) => setCareerId(e.target.value)} className="max-w-[240px]">
          <option value="">Tất cả vị trí</option>
          {(careersData?.items ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(a) => a.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách.' : null}
        emptyMessage="Chưa có đơn ứng tuyển nào."
      />

      {hasMore ? (
        <div className="flex justify-center pt-4">
          <Button variant="outline" disabled={!!loadingMore} onClick={() => setSize(size + 1)}>
            {loadingMore ? 'Đang tải…' : 'Tải thêm'}
          </Button>
        </div>
      ) : null}

      <ApplicationDetailDialog application={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
