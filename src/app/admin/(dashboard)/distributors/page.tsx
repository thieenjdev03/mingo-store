'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { DistributorDto } from '@/lib/api/generated/ecomAPI.schemas';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Badge } from '@/components/admin/ui/badge';
import { Pagination } from '@/components/admin/ui/pagination';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { provinces } from '@/lib/vn-address';
import { DistributorForm } from '@/features/admin/distributors/distributor-form';
import { distributorsKey, listDistributors, deleteDistributor } from '@/features/admin/distributors/api';

const LIMIT = 10;

export default function AdminDistributorsPage() {
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [active, setActive] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);

  const params = {
    q: q.trim() || undefined,
    province_code: provinceCode || undefined,
    is_active: active === 'all' ? undefined : active === 'true',
    page,
    limit: LIMIT,
  };
  const { data, isLoading, error, mutate } = useSWR(distributorsKey(params), () => listDistributors(params));
  const rows = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DistributorDto | null>(null);
  const [deleting, setDeleting] = useState<DistributorDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteDistributor(deleting.id);
      toast({ title: 'Đã xoá nhà phân phối', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<DistributorDto>[] = [
    { key: 'name', header: 'Tên', render: (d) => <span className="font-semibold">{d.name}</span> },
    { key: 'address', header: 'Địa chỉ', render: (d) => <span className="text-muted-foreground">{d.address_line}</span> },
    { key: 'province', header: 'Tỉnh/Thành', render: (d) => d.province_name },
    { key: 'categories', header: 'DM', align: 'center', render: (d) => d.categories?.length ?? 0 },
    { key: 'collections', header: 'BST', align: 'center', render: (d) => d.collections?.length ?? 0 },
    {
      key: 'is_active',
      header: 'Trạng thái',
      align: 'center',
      render: (d) => <Badge tone={d.is_active ? 'success' : 'neutral'}>{d.is_active ? 'Hoạt động' : 'Ẩn'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (d) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => { setEditing(d); setFormOpen(true); }}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Xoá" onClick={() => setDeleting(d)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Nhà phân phối"
        description="Quản lý điểm bán / nhà phân phối hiển thị ở trang cửa hàng."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Thêm
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Tìm theo tên hoặc địa chỉ…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <NativeSelect value={provinceCode} onChange={(e) => { setProvinceCode(e.target.value); setPage(1); }} className="max-w-[200px]">
          <option value="">Tất cả tỉnh/thành</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </NativeSelect>
        <NativeSelect value={active} onChange={(e) => { setActive(e.target.value as typeof active); setPage(1); }} className="max-w-[160px]">
          <option value="all">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Ẩn</option>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(d) => d.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách.' : null}
        emptyMessage="Chưa có nhà phân phối nào."
      />
      <Pagination page={page} totalPages={totalPages} total={data?.total} onPageChange={setPage} />

      <DistributorForm open={formOpen} onOpenChange={setFormOpen} distributor={editing} onSaved={() => mutate()} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá nhà phân phối?"
        description={deleting ? `"${deleting.name}" sẽ bị xoá.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
