'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Boxes, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Badge } from '@/components/admin/ui/badge';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { CollectionForm } from '@/features/admin/collections/collection-form';
import { CollectionProductsDialog } from '@/features/admin/collections/collection-products-dialog';
import { collectionsKey, listCollections, deleteCollection, type CollectionItem } from '@/features/admin/collections/api';

export default function AdminCollectionsPage() {
  const { toast } = useToast();
  const { data, isLoading, error, mutate } = useSWR(collectionsKey, listCollections);
  const collections = useMemo(() => data ?? [], [data]);

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionItem | null>(null);
  const [productsFor, setProductsFor] = useState<CollectionItem | null>(null);
  const [deleting, setDeleting] = useState<CollectionItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return collections.filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [collections, search]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteCollection(deleting.id);
      toast({ title: 'Đã xoá bộ sưu tập', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<CollectionItem>[] = [
    {
      key: 'name',
      header: 'Tên',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded border border-border bg-muted">
            {c.banner_image_url ? <Image src={c.banner_image_url} alt="" fill className="object-cover" sizes="56px" /> : null}
          </div>
          <div>
            <p className="font-semibold">{c.name}</p>
            {c.description ? <p className="line-clamp-1 text-xs text-muted-foreground">{c.description}</p> : null}
          </div>
        </div>
      ),
    },
    { key: 'slug', header: 'Slug', render: (c) => <span className="text-muted-foreground">{c.slug}</span> },
    {
      key: 'is_active',
      header: 'Trạng thái',
      align: 'center',
      render: (c) => (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <Badge tone={c.is_active ? 'success' : 'neutral'}>{c.is_active ? 'Hiển thị' : 'Ẩn'}</Badge>
          {c.homepage_section?.trim() ? <Badge tone="info">Trang chủ</Badge> : null}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Sản phẩm" onClick={() => setProductsFor(c)}>
            <Boxes className="size-4" />
          </Button>
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
        title="Bộ sưu tập"
        description="Nhóm sản phẩm theo bộ sưu tập; gán sản phẩm cho từng bộ."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Thêm bộ sưu tập
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
        error={error ? 'Không tải được bộ sưu tập.' : null}
        emptyMessage="Chưa có bộ sưu tập nào."
      />

      <CollectionForm open={formOpen} onOpenChange={setFormOpen} collection={editing} onSaved={() => mutate()} />
      <CollectionProductsDialog open={!!productsFor} onOpenChange={(o) => !o && setProductsFor(null)} collection={productsFor} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá bộ sưu tập?"
        description={deleting ? `"${deleting.name}" sẽ bị xoá.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
