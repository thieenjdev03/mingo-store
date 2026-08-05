'use client';

import { useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ProductResponseDto, ProductsControllerFindAllStatus } from '@/lib/api/generated/ecomAPI.schemas';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Badge } from '@/components/admin/ui/badge';
import { Pagination } from '@/components/admin/ui/pagination';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { fCurrencyVND } from '@/lib/format';
import { resolveLocalized } from '@/types/localized';
import { ProductForm } from '@/features/admin/products/product-form';
import { productsKey, listProducts, deleteProduct } from '@/features/admin/products/api';
import { categoriesKey, listCategories } from '@/features/admin/categories/api';
import { brandsKey, listBrands } from '@/features/admin/brands/api';

const LIMIT = 10;
const STATUS_LABEL: Record<string, string> = {
  active: 'Đăng bán', draft: 'Nháp', inactive: 'Ẩn', out_of_stock: 'Hết hàng (dữ liệu cũ)', discontinued: 'Ngừng bán (dữ liệu cũ)',
};

const STATUS_FILTERS = [
  { value: 'active', label: 'Đăng bán' },
  { value: 'draft', label: 'Nháp' },
  { value: 'inactive', label: 'Ẩn' },
] as const;

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | ProductsControllerFindAllStatus>('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [page, setPage] = useState(1);

  // Danh mục để đổ vào filter — backend lọc bằng category_id nên gửi thẳng ID.
  const { data: categories } = useSWR(categoriesKey, listCategories);
  const { data: brands } = useSWR(brandsKey, () => listBrands());

  const params = {
    locale: 'vi' as const,
    search: search.trim() || undefined,
    status: status || undefined,
    category_id: categoryId || undefined,
    brand_id: brandId || undefined,
    page,
    limit: LIMIT,
  };
  const { data, isLoading, error, mutate } = useSWR(productsKey(params), () => listProducts(params));
  const rows = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ProductResponseDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreate = () => { setEditingId(null); setFormOpen(true); };
  const openEdit = (id: string) => { setEditingId(id); setFormOpen(true); };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deleting.id);
      toast({ title: 'Đã xoá sản phẩm', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<ProductResponseDto>[] = [
    {
      key: 'name',
      header: 'Sản phẩm',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
            {p.images?.[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" /> : null}
          </div>
          <span className="font-semibold">{resolveLocalized(p.name, 'vi')}</span>
        </div>
      ),
    },
    { key: 'category', header: 'Danh mục', render: (p) => p.category?.name || <span className="text-muted-foreground">—</span> },
    { key: 'brand', header: 'Thương hiệu', render: (p) => p.brand?.name || <span className="text-muted-foreground">—</span> },
    { key: 'price', header: 'Giá', align: 'right', render: (p) => fCurrencyVND(Number(p.sale_price ?? p.price)) },
    { key: 'stock_quantity', header: 'Tồn', align: 'center', render: (p) => p.stock_quantity },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (p) => <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>{STATUS_LABEL[p.status] ?? p.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => openEdit(p.id)}>
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
        title="Sản phẩm"
        description="Quản lý sản phẩm (song ngữ, nhiều ảnh)."
        action={<Button onClick={openCreate}><Plus className="size-4" /> Thêm sản phẩm</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Tìm theo tên…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
        <NativeSelect fitContent value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}>
          <option value="">Tất cả danh mục</option>
          {(categories ?? []).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </NativeSelect>
        <NativeSelect fitContent value={brandId} onChange={(e) => { setBrandId(e.target.value); setPage(1); }}>
          <option value="">Tất cả thương hiệu</option>
          {(brands ?? []).map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </NativeSelect>
        <NativeSelect fitContent value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          {STATUS_FILTERS.map(({ value, label }) => (<option key={value} value={value}>{label}</option>))}
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(p) => p.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách sản phẩm.' : null}
        emptyMessage="Chưa có sản phẩm nào."
      />
      <Pagination page={page} totalPages={totalPages} total={data?.meta?.total} onPageChange={setPage} />

      <ProductForm open={formOpen} onOpenChange={setFormOpen} productId={editingId} onSaved={() => mutate()} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá sản phẩm?"
        description={deleting ? `"${resolveLocalized(deleting.name, 'vi')}" sẽ bị xoá.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
