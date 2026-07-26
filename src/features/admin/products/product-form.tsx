'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
import { MultiImageUpload } from '@/components/admin/ui/multi-image-upload';
import { useToast } from '@/components/admin/ui/toast';
import { slugify } from '@/lib/admin/slugify';
import { getCategoryOptions } from '@/features/admin/shared/options';
import type { CreateProductDtoStatus } from '@/lib/api/generated/ecomAPI.schemas';
import { getProductForEdit, createProduct, updateProduct } from './api';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
  onSaved: () => void;
}

const STATUSES: { value: CreateProductDtoStatus; label: string }[] = [
  { value: 'active', label: 'Đang bán' },
  { value: 'draft', label: 'Nháp' },
  { value: 'inactive', label: 'Ẩn' },
  { value: 'out_of_stock', label: 'Hết hàng' },
  { value: 'discontinued', label: 'Ngừng bán' },
];

const empty = { vi: '', en: '' };

export function ProductForm({ open, onOpenChange, productId, onSaved }: ProductFormProps) {
  const { toast } = useToast();
  const { data: categoryOptions = [] } = useSWR('admin-category-options', getCategoryOptions);
  const { data: editData, isLoading: loadingEdit } = useSWR(
    open && productId ? ['product-edit', productId] : null,
    () => getProductForEdit(productId!),
  );

  const [nameVi, setNameVi] = useState(''); const [nameEn, setNameEn] = useState('');
  const [slugVi, setSlugVi] = useState(''); const [slugEn, setSlugEn] = useState('');
  const [shortVi, setShortVi] = useState(''); const [shortEn, setShortEn] = useState('');
  const [descVi, setDescVi] = useState(''); const [descEn, setDescEn] = useState('');
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState(0);
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<CreateProductDtoStatus>('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [enableSaleTag, setEnableSaleTag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (productId && editData) {
      setNameVi(editData.name.vi); setNameEn(editData.name.en);
      setSlugVi(editData.slug.vi); setSlugEn(editData.slug.en);
      setShortVi(editData.short_description.vi); setShortEn(editData.short_description.en);
      setDescVi(editData.description.vi); setDescEn(editData.description.en);
      setPrice(Number(editData.base.price) || 0);
      setSalePrice(editData.base.sale_price != null ? String(editData.base.sale_price) : '');
      setStock(editData.base.stock_quantity ?? 0);
      setSku(editData.base.sku ?? '');
      setCategoryId(editData.base.category?.id ?? '');
      setImages(editData.base.images ?? []);
      setStatus((editData.base.status as CreateProductDtoStatus) ?? 'active');
      setIsFeatured(editData.base.is_featured ?? false);
      setEnableSaleTag(editData.base.enable_sale_tag ?? false);
    } else if (!productId) {
      setNameVi(''); setNameEn(''); setSlugVi(''); setSlugEn('');
      setShortVi(''); setShortEn(''); setDescVi(''); setDescEn('');
      setPrice(0); setSalePrice(''); setStock(0); setSku(''); setCategoryId('');
      setImages([]); setStatus('active'); setIsFeatured(false); setEnableSaleTag(false);
    }
  }, [open, productId, editData]);

  const onSubmit = async () => {
    if (!nameVi.trim() && !nameEn.trim()) {
      setError('Cần nhập tên sản phẩm (ít nhất một ngôn ngữ).');
      return;
    }
    if (!price || price <= 0) {
      setError('Giá phải lớn hơn 0.');
      return;
    }
    setSaving(true);
    try {
      const loc = (vi: string, en: string) => ({ vi: vi || en, en: en || vi });
      const nm = loc(nameVi.trim(), nameEn.trim());
      const payload = {
        name: nm,
        slug: loc(slugVi.trim() || slugify(nm.vi), slugEn.trim() || slugify(nm.en)),
        short_description: shortVi || shortEn ? loc(shortVi.trim(), shortEn.trim()) : undefined,
        description: descVi || descEn ? loc(descVi.trim(), descEn.trim()) : undefined,
        price: Number(price),
        sale_price: salePrice ? Number(salePrice) : undefined,
        images,
        stock_quantity: Number(stock) || 0,
        sku: sku.trim() || undefined,
        category_id: categoryId || undefined,
        status,
        is_featured: isFeatured,
        enable_sale_tag: enableSaleTag,
      };
      if (productId) {
        await updateProduct(productId, payload);
        toast({ title: 'Đã cập nhật sản phẩm', tone: 'success' });
      } else {
        await createProduct(payload);
        toast({ title: 'Đã tạo sản phẩm', tone: 'success' });
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast({ title: 'Lưu thất bại', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={productId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      className="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Huỷ</Button>
          <Button onClick={onSubmit} disabled={saving || (!!productId && loadingEdit)}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </>
      }
    >
      {productId && loadingEdit ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Đang tải…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="nameVi" label="Tên (VI)"><Input id="nameVi" value={nameVi} onChange={(e) => setNameVi(e.target.value)} /></Field>
            <Field id="nameEn" label="Tên (EN)" required={false}><Input id="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} /></Field>
            <Field id="slugVi" label="Slug (VI)" required={false} hint="Bỏ trống để tự sinh."><Input id="slugVi" value={slugVi} onChange={(e) => setSlugVi(e.target.value)} /></Field>
            <Field id="slugEn" label="Slug (EN)" required={false}><Input id="slugEn" value={slugEn} onChange={(e) => setSlugEn(e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="shortVi" label="Mô tả ngắn (VI)" required={false}><Textarea id="shortVi" rows={2} value={shortVi} onChange={(e) => setShortVi(e.target.value)} /></Field>
            <Field id="shortEn" label="Mô tả ngắn (EN)" required={false}><Textarea id="shortEn" rows={2} value={shortEn} onChange={(e) => setShortEn(e.target.value)} /></Field>
            <Field id="descVi" label="Mô tả (VI)" required={false}><Textarea id="descVi" rows={4} value={descVi} onChange={(e) => setDescVi(e.target.value)} /></Field>
            <Field id="descEn" label="Mô tả (EN)" required={false}><Textarea id="descEn" rows={4} value={descEn} onChange={(e) => setDescEn(e.target.value)} /></Field>
          </div>
          <Field id="images" label="Ảnh sản phẩm" required={false}>
            <MultiImageUpload value={images} onChange={setImages} folder="products" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="price" label="Giá (VND)"><Input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} /></Field>
            <Field id="sale" label="Giá KM" required={false}><Input id="sale" type="number" min={0} value={salePrice} onChange={(e) => setSalePrice(e.target.value)} /></Field>
            <Field id="stock" label="Tồn kho" required={false}><Input id="stock" type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="sku" label="SKU" required={false}><Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} /></Field>
            <Field id="category" label="Danh mục" required={false}>
              <NativeSelect id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">— Không —</option>
                {categoryOptions.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </NativeSelect>
            </Field>
            <Field id="status" label="Trạng thái" required={false} error={error ?? undefined}>
              <NativeSelect id="status" value={status} onChange={(e) => setStatus(e.target.value as CreateProductDtoStatus)}>
                {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
              </NativeSelect>
            </Field>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              <label htmlFor="featured" className="text-sm font-semibold text-foreground">Nổi bật</label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="saletag" checked={enableSaleTag} onCheckedChange={setEnableSaleTag} />
              <label htmlFor="saletag" className="text-sm font-semibold text-foreground">Hiện nhãn giảm giá</label>
            </div>
          </div>
          <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Biến thể màu/size chưa hỗ trợ (backend chưa khai báo OpenAPI cho /colors, /sizes; variant yêu cầu size_id).
          </p>
        </div>
      )}
    </Dialog>
  );
}
