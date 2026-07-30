'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { BrandDto } from '@/lib/api/generated/ecomAPI.schemas';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Badge } from '@/components/admin/ui/badge';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { BrandForm } from '@/features/admin/brands/brand-form';
import { brandsKey, deleteBrand, listBrands } from '@/features/admin/brands/api';

type StatusFilter = 'all' | 'active' | 'inactive';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export default function AdminBrandsPage() {
  const { toast } = useToast();
  const { data, isLoading, error, mutate } = useSWR(brandsKey, () => listBrands());
  const brands = useMemo(() => data ?? [], [data]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BrandDto | null>(null);
  const [deleting, setDeleting] = useState<BrandDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const rows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return brands.filter((brand) => {
      const matchesQuery =
        !query ||
        brand.name.toLocaleLowerCase('vi').includes(query) ||
        brand.slug.toLocaleLowerCase('vi').includes(query) ||
        (brand.description ?? '').toLocaleLowerCase('vi').includes(query);
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && brand.is_active) ||
        (status === 'inactive' && !brand.is_active);
      return matchesQuery && matchesStatus;
    });
  }, [brands, search, status]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (brand: BrandDto) => {
    setEditing(brand);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteBrand(deleting.id);
      toast({ title: 'Đã xoá thương hiệu', tone: 'success' });
      setDeleting(null);
      await mutate();
    } catch (deleteError) {
      toast({
        title: getApiErrorMessage(deleteError, 'Không thể xoá thương hiệu.'),
        tone: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<BrandDto>[] = [
    {
      key: 'name',
      header: 'Thương hiệu',
      render: (brand) => (
        <div className="flex min-w-52 items-center gap-3">
          <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {brand.logo_url ? (
              <Image src={brand.logo_url} alt={`Logo ${brand.name}`} fill className="object-contain p-1" sizes="48px" />
            ) : (
              <span className="text-lg font-bold text-muted-foreground">{brand.name.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{brand.name}</p>
            {brand.description ? (
              <p className="max-w-72 truncate text-xs text-muted-foreground">{brand.description}</p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (brand) => <code className="text-xs text-muted-foreground">{brand.slug}</code>,
    },
    { key: 'display_order', header: 'Thứ tự', align: 'center', render: (brand) => brand.display_order },
    {
      key: 'is_active',
      header: 'Trạng thái',
      align: 'center',
      render: (brand) => (
        <Badge tone={brand.is_active ? 'success' : 'neutral'}>
          {brand.is_active ? 'Đang hiển thị' : 'Đang ẩn'}
        </Badge>
      ),
    },
    {
      key: 'updated_at',
      header: 'Cập nhật',
      render: (brand) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(brand.updated_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (brand) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label={`Sửa ${brand.name}`} onClick={() => openEdit(brand)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Xoá ${brand.name}`} onClick={() => setDeleting(brand)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Thương hiệu"
        description="Quản lý thương hiệu, logo và thứ tự hiển thị trên storefront."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Thêm thương hiệu
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Tìm theo tên, slug hoặc mô tả…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <NativeSelect
          fitContent
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiển thị</option>
          <option value="inactive">Đang ẩn</option>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(brand) => brand.id}
        loading={isLoading}
        error={error ? getApiErrorMessage(error, 'Không tải được danh sách thương hiệu.') : null}
        emptyMessage={brands.length === 0 ? 'Chưa có thương hiệu nào.' : 'Không tìm thấy thương hiệu phù hợp.'}
      />

      <BrandForm
        open={formOpen}
        onOpenChange={setFormOpen}
        brand={editing}
        onSaved={() => mutate()}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Xoá thương hiệu?"
        description={
          deleting
            ? `"${deleting.name}" sẽ bị xoá khỏi danh sách. Slug "${deleting.slug}" vẫn được giữ và không thể dùng lại.`
            : undefined
        }
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
