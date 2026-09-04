'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { FileText, Trash2 } from 'lucide-react';
import type {
  CareerApplicationDtoStatus,
  CareerApplicationsControllerFindAllStatus,
} from '@/lib/api/generated/ecomAPI.schemas';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Pagination } from '@/components/admin/ui/pagination';
import { Button } from '@/components/admin/ui/button';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import {
  careersKey,
  listCareers,
  allApplicationsKey,
  listAllApplications,
  updateApplicationStatus,
  deleteApplication,
  type AdminApplication,
} from '@/features/admin/careers/api';
import { ApplicationDetailDialog } from '@/features/admin/careers/application-detail-dialog';
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL } from '@/features/admin/careers/status';

const PAGE_SIZE = 10;

export default function AdminCareerApplicationsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | CareerApplicationsControllerFindAllStatus>('');
  const [careerId, setCareerId] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminApplication | null>(null);
  const [deleting, setDeleting] = useState<AdminApplication | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Danh sách tin tuyển dụng chỉ để đổ vào bộ lọc "Vị trí".
  const careersParams = { limit: 100 };
  const { data: careersData } = useSWR(careersKey(careersParams), () => listCareers(careersParams));

  const params = {
    search: search.trim() || undefined,
    status: status || undefined,
    career_id: careerId || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, error, mutate } = useSWR(allApplicationsKey(params), () => listAllApplications(params));

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Đổi bộ lọc -> quay về trang 1 (tránh kẹt ở trang vượt quá tổng số mới).
  const resetPage = () => setPage(1);

  const onStatusChange = async (app: AdminApplication, next: CareerApplicationDtoStatus) => {
    try {
      await updateApplicationStatus(app.id, { status: next });
      toast({ title: 'Đã cập nhật trạng thái', tone: 'success' });
      mutate();
    } catch {
      toast({ title: 'Cập nhật thất bại', tone: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteApplication(deleting.id);
      toast({ title: 'Đã xoá đơn ứng tuyển', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<AdminApplication>[] = [
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
          onChange={(e) => onStatusChange(a, e.target.value as CareerApplicationDtoStatus)}
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
        <div className="flex items-center justify-end gap-1">
          <a
            href={a.cv_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <FileText className="size-4" /> CV
          </a>
          <Button variant="ghost" size="icon" aria-label="Xoá" onClick={() => setDeleting(a)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
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
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="max-w-xs"
        />
        <NativeSelect fitContent value={status} onChange={(e) => { setStatus(e.target.value as typeof status); resetPage(); }}>
          <option value="">Tất cả trạng thái</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>
          ))}
        </NativeSelect>
        <NativeSelect fitContent value={careerId} onChange={(e) => { setCareerId(e.target.value); resetPage(); }}>
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
        emptyMessage={search || status || careerId ? 'Không có đơn nào khớp bộ lọc.' : 'Chưa có đơn ứng tuyển nào.'}
      />
      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <ApplicationDetailDialog application={detail} onClose={() => setDetail(null)} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá đơn ứng tuyển?"
        description={deleting ? `Xoá đơn của "${deleting.full_name}" cho vị trí "${deleting.career_title}". Hành động này không thể hoàn tác.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
