'use client';

import { useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Badge } from '@/components/admin/ui/badge';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { BannerForm } from '@/features/admin/homepage/banner-form';
import { bannersKey, listBanners, deleteBanner, type BannerDto } from '@/features/admin/homepage/api';

export default function AdminBannersPage() {
  const { toast } = useToast();
  const { data, isLoading, error, mutate } = useSWR(bannersKey, listBanners);
  const banners = data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BannerDto | null>(null);
  const [deleting, setDeleting] = useState<BannerDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteBanner(deleting.id);
      toast({ title: 'Đã xoá banner', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<BannerDto>[] = [
    {
      key: 'image',
      header: 'Ảnh',
      render: (b) => (
        <div className="relative h-12 w-20 overflow-hidden rounded border border-border bg-muted">
          {b.image_url ? <Image src={b.image_url} alt={b.alt_text ?? ''} fill className="object-cover" sizes="80px" /> : null}
        </div>
      ),
    },
    { key: 'alt_text', header: 'Alt text', render: (b) => b.alt_text || <span className="text-muted-foreground">—</span> },
    { key: 'link_url', header: 'Link', render: (b) => b.link_url || <span className="text-muted-foreground">—</span> },
    { key: 'display_order', header: 'Thứ tự', align: 'center', render: (b) => b.display_order },
    {
      key: 'is_active',
      header: 'Trạng thái',
      align: 'center',
      render: (b) => <Badge tone={b.is_active ? 'success' : 'neutral'}>{b.is_active ? 'Hiển thị' : 'Ẩn'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => { setEditing(b); setFormOpen(true); }}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Xoá" onClick={() => setDeleting(b)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Banner trang chủ"
        description="Quản lý banner hiển thị ở hero trang chủ."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Thêm banner
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={banners}
        rowKey={(b) => b.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách banner.' : null}
        emptyMessage="Chưa có banner nào."
      />

      <BannerForm open={formOpen} onOpenChange={setFormOpen} banner={editing} onSaved={() => mutate()} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá banner?"
        description="Banner sẽ bị gỡ khỏi trang chủ."
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
