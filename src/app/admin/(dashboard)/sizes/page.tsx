'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { AdminSizeView } from '@/features/admin/sizes/types';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Badge } from '@/components/admin/ui/badge';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { SizeForm } from '@/features/admin/sizes/size-form';
import { sizesKey, listSizes, deleteSize } from '@/features/admin/sizes/api';

export default function AdminSizesPage() {
  const { toast } = useToast();
  const { data, isLoading, error, mutate } = useSWR(sizesKey(), () => listSizes());
  const sizes = useMemo(() => data ?? [], [data]);

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSizeView | null>(null);
  const [deleting, setDeleting] = useState<AdminSizeView | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sizes.filter((s) => !q || s.name.toLowerCase().includes(q) || (s.unit ?? '').toLowerCase().includes(q));
  }, [sizes, search]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteSize(deleting.id);
      toast({ title: 'Đã xoá quy cách', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const dash = <span className="text-muted-foreground">—</span>;

  const columns: Column<AdminSizeView>[] = [
    { key: 'name', header: 'Nhãn quy cách', render: (s) => <span className="font-semibold">{s.name}</span> },
    { key: 'unit', header: 'Đơn vị', render: (s) => s.unit || dash },
    { key: 'packQty', header: 'SL/thùng', align: 'center', render: (s) => s.packQty ?? dash },
    { key: 'volumeMl', header: 'Khối lượng / Dung tích', align: 'center', render: (s) => (s.volumeMl != null ? `${s.volumeMl} ${s.volumeUnit ?? 'ml'}` : dash) },
    { key: 'sortOrder', header: 'Thứ tự', align: 'center', render: (s) => s.sortOrder },
    {
      key: 'categories',
      header: 'Phạm vi',
      render: (s) => (
        s.categories.length > 0
          ? <div className="flex flex-wrap gap-1">{s.categories.map((category) => <Badge key={category.id} tone="info">{category.name}</Badge>)}</div>
          : <Badge>Toàn cục</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => { setEditing(s); setFormOpen(true); }}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Xoá" onClick={() => setDeleting(s)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quy cách / Kích cỡ"
        description="Nhãn quy cách đóng gói kem (24 cây/thùng, Hộp 250ml…). Sản phẩm tham chiếu qua variant."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Thêm quy cách
          </Button>
        }
      />

      <div className="mb-4">
        <Input placeholder="Tìm theo nhãn hoặc đơn vị…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(s) => s.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách quy cách.' : null}
        emptyMessage="Chưa có quy cách nào."
      />

      <SizeForm open={formOpen} onOpenChange={setFormOpen} size={editing} onSaved={() => mutate()} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá quy cách?"
        description={deleting ? `"${deleting.name}" sẽ bị xoá.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
