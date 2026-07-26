'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Badge } from '@/components/admin/ui/badge';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { CategoryForm } from '@/features/admin/categories/category-form';
import { categoriesKey, listCategories, deleteCategory, type CategoryItem } from '@/features/admin/categories/api';

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const { data, isLoading, error, mutate } = useSWR(categoriesKey, listCategories);
  const categories = useMemo(() => data ?? [], [data]);

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState<CategoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, search]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deleting.id);
      toast({ title: 'Đã xoá danh mục', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<CategoryItem>[] = [
    {
      key: 'name',
      header: 'Tên',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="relative size-9 shrink-0 overflow-hidden rounded border border-border bg-muted">
            {c.image_url ? <Image src={c.image_url} alt="" fill className="object-cover" sizes="36px" /> : null}
          </div>
          <span className="font-semibold">{c.name}</span>
        </div>
      ),
    },
    { key: 'slug', header: 'Slug', render: (c) => <span className="text-muted-foreground">{c.slug}</span> },
    { key: 'parent_name', header: 'Danh mục cha', render: (c) => c.parent_name || <span className="text-muted-foreground">—</span> },
    { key: 'display_order', header: 'Thứ tự', align: 'center', render: (c) => c.display_order },
    {
      key: 'is_active',
      header: 'Trạng thái',
      align: 'center',
      render: (c) => <Badge tone={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'Hiển thị' : 'Ẩn'}</Badge>,
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
        title="Danh mục"
        description="Quản lý danh mục sản phẩm (hỗ trợ danh mục cha/con)."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Thêm danh mục
          </Button>
        }
      />

      <div className="mb-4">
        <Input placeholder="Tìm theo tên hoặc slug…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(c) => c.id}
        loading={isLoading}
        error={error ? 'Không tải được danh mục.' : null}
        emptyMessage="Chưa có danh mục nào."
      />

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        allCategories={categories}
        onSaved={() => mutate()}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá danh mục?"
        description={deleting ? `"${deleting.name}" sẽ bị xoá.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
