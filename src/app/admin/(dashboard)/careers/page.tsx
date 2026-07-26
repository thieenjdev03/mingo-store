'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { CareerDto, CareersControllerFindAllStatus } from '@/lib/api/generated/ecomAPI.schemas';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Badge } from '@/components/admin/ui/badge';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { CareerForm } from '@/features/admin/careers/career-form';
import { careersKey, listCareers, deleteCareer } from '@/features/admin/careers/api';

const STATUS_TONE = { published: 'success', draft: 'neutral', closed: 'danger' } as const;
const STATUS_LABEL = { published: 'Đã đăng', draft: 'Nháp', closed: 'Đã đóng' } as const;

export default function AdminCareersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | CareersControllerFindAllStatus>('');

  const params = { search: search.trim() || undefined, status: status || undefined, limit: 100 };
  const { data, isLoading, error, mutate } = useSWR(careersKey(params), () => listCareers(params));
  const rows = data?.items ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CareerDto | null>(null);
  const [deleting, setDeleting] = useState<CareerDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteCareer(deleting.id);
      toast({ title: 'Đã xoá tin tuyển dụng', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<CareerDto>[] = [
    {
      key: 'title',
      header: 'Tiêu đề',
      render: (c) => (
        <span className="flex items-center gap-2 font-semibold">
          {c.is_primary ? <Star className="size-4 fill-amber-400 text-amber-400" /> : null}
          {c.title}
        </span>
      ),
    },
    { key: 'category', header: 'Bộ phận', render: (c) => c.category || <span className="text-muted-foreground">—</span> },
    { key: 'location', header: 'Địa điểm', render: (c) => c.location || <span className="text-muted-foreground">—</span> },
    { key: 'level', header: 'Cấp bậc', render: (c) => c.level || <span className="text-muted-foreground">—</span> },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (c) => <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => { setEditing(c); setFormOpen(true); }}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Xoá" onClick={() => setDeleting(c)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tuyển dụng"
        description="Quản lý tin tuyển dụng hiển thị ở trang nghề nghiệp."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Thêm tin
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Tìm theo tiêu đề…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="max-w-[180px]">
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="published">Đã đăng</option>
          <option value="closed">Đã đóng</option>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách.' : null}
        emptyMessage="Chưa có tin tuyển dụng nào."
      />

      <CareerForm open={formOpen} onOpenChange={setFormOpen} career={editing} onSaved={() => mutate()} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá tin tuyển dụng?"
        description={deleting ? `"${deleting.title}" sẽ bị xoá.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
