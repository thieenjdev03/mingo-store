'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { PolicyDto } from '@/lib/api/generated/ecomAPI.schemas';
import { usePoliciesControllerFindAll } from '@/lib/api/generated/policies-admin/policies-admin';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Badge } from '@/components/admin/ui/badge';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { PolicyForm } from '@/features/admin/policies/policy-form';
import { deletePolicy } from '@/features/admin/policies/api';

export default function AdminPoliciesPage() {
  const { toast } = useToast();
  const { data, isLoading, error, mutate } = usePoliciesControllerFindAll();
  const policies = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PolicyDto | null>(null);
  const [deleting, setDeleting] = useState<PolicyDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return policies.filter((p) => {
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      const matchesActive =
        activeFilter === 'all' || (activeFilter === 'active' ? p.is_active : !p.is_active);
      return matchesSearch && matchesActive;
    });
  }, [policies, search, activeFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (policy: PolicyDto) => {
    setEditing(policy);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deletePolicy(deleting.id);
      toast({ title: 'Đã xoá chính sách', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<PolicyDto>[] = [
    { key: 'title', header: 'Tiêu đề', render: (p) => <span className="font-semibold">{p.title}</span> },
    { key: 'slug', header: 'Slug', render: (p) => <span className="text-muted-foreground">{p.slug}</span> },
    { key: 'display_order', header: 'Thứ tự', align: 'center', render: (p) => p.display_order },
    {
      key: 'is_active',
      header: 'Trạng thái',
      align: 'center',
      render: (p) => <Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'Hiển thị' : 'Ẩn'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => openEdit(p)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Xoá" onClick={() => setDeleting(p)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Chính sách"
        description="Quản lý các trang chính sách hiển thị ở storefront."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Thêm chính sách
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Tìm theo tiêu đề hoặc slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <NativeSelect
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
          className="max-w-[180px]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiển thị</option>
          <option value="inactive">Đang ẩn</option>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách chính sách.' : null}
        emptyMessage="Chưa có chính sách nào."
      />

      <PolicyForm open={formOpen} onOpenChange={setFormOpen} policy={editing} onSaved={() => mutate()} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá chính sách?"
        description={deleting ? `"${deleting.title}" sẽ bị xoá khỏi storefront.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
