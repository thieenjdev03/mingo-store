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
import { Plus, Trash2 } from 'lucide-react';
import { slugify } from '@/lib/admin/slugify';
import { getCategoryOptions } from '@/features/admin/shared/options';
import { brandsKey, listBrands } from '@/features/admin/brands/api';
import { listSizes } from '@/features/admin/sizes/api';
import { packagingLabel } from '@/features/product/types';
import type { CreateProductDtoStatus } from '@/lib/api/generated/ecomAPI.schemas';
import { getProductForEdit, createProduct, updateProduct } from './api';

interface VariantRow {
  size_id: string;
  sku: string;
  price: number;
  stock: number;
}

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

export function ProductForm({ open, onOpenChange, productId, onSaved }: ProductFormProps) {
  const { toast } = useToast();
  const { data: categoryOptions = [] } = useSWR('admin-category-options', getCategoryOptions);
  const { data: brandOptions = [] } = useSWR(brandsKey, () => listBrands());
  const { data: sizeOptions = [] } = useSWR('admin-size-options', () => listSizes());
  const { data: editData, isLoading: loadingEdit } = useSWR(
    open && productId ? ['product-edit', productId] : null,
    () => getProductForEdit(productId!),
  );

  const [nameVi, setNameVi] = useState(''); const [nameEn, setNameEn] = useState('');
  const [slugVi, setSlugVi] = useState(''); const [slugEn, setSlugEn] = useState('');
  const [shortVi, setShortVi] = useState(''); const [shortEn, setShortEn] = useState('');
  const [nutritionVi, setNutritionVi] = useState(''); const [nutritionEn, setNutritionEn] = useState('');
  const [descVi, setDescVi] = useState(''); const [descEn, setDescEn] = useState('');
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState(0);
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<CreateProductDtoStatus>('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [enableSaleTag, setEnableSaleTag] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  // Field bắt buộc (tên) tự mirror sang EN cho tới khi người dùng tự sửa tab EN.
  const [nameEnEdited, setNameEnEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const changeNameVi = (val: string) => {
    setNameVi(val);
    if (!nameEnEdited) setNameEn(val);
  };
  const changeNameEn = (val: string) => {
    setNameEnEdited(true);
    setNameEn(val);
  };

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLang('vi');
    if (productId && editData) {
      setNameEnEdited(!!editData.name.en);
      setNameVi(editData.name.vi); setNameEn(editData.name.en);
      setSlugVi(editData.slug.vi); setSlugEn(editData.slug.en);
      setShortVi(editData.short_description.vi); setShortEn(editData.short_description.en);
      setNutritionVi(editData.nutrition_information.vi); setNutritionEn(editData.nutrition_information.en);
      setDescVi(editData.description.vi); setDescEn(editData.description.en);
      setPrice(Number(editData.base.price) || 0);
      setSalePrice(editData.base.sale_price != null ? String(editData.base.sale_price) : '');
      setStock(editData.base.stock_quantity ?? 0);
      setSku(editData.base.sku ?? '');
      setCategoryId(editData.base.category?.id ?? '');
      setBrandId(editData.base.brand?.id ?? '');
      setImages(editData.base.images ?? []);
      setStatus((editData.base.status as CreateProductDtoStatus) ?? 'active');
      setIsFeatured(editData.base.is_featured ?? false);
      setEnableSaleTag(editData.base.enable_sale_tag ?? false);
      setVariants(
        (editData.base.variants ?? []).map((v) => ({
          size_id: v.size_id ?? v.size?.id ?? '',
          sku: v.sku,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        })),
      );
    } else if (!productId) {
      setNameEnEdited(false);
      setNameVi(''); setNameEn(''); setSlugVi(''); setSlugEn('');
      setShortVi(''); setShortEn(''); setNutritionVi(''); setNutritionEn(''); setDescVi(''); setDescEn('');
      setPrice(0); setSalePrice(''); setStock(0); setSku(''); setCategoryId(''); setBrandId('');
      setImages([]); setStatus('active'); setIsFeatured(false); setEnableSaleTag(false);
      setVariants([]);
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
    if (variants.some((v) => !v.size_id || !v.sku.trim())) {
      setError('Mỗi biến thể cần chọn quy cách và nhập SKU.');
      return;
    }
    setSaving(true);
    try {
      const loc = (vi: string, en: string) => ({ vi: vi || en, en: en || vi });
      const nm = loc(nameVi.trim(), nameEn.trim());
      const variantPayload = variants.map((v) => {
        const sizeName = sizeOptions.find((s) => s.id === v.size_id)?.name ?? v.sku;
        return { name: { vi: sizeName, en: sizeName }, sku: v.sku.trim(), price: Number(v.price) || 0, stock: Number(v.stock) || 0, size_id: v.size_id };
      });
      const payload = {
        name: nm,
        slug: loc(slugVi.trim() || slugify(nm.vi), slugEn.trim() || slugify(nm.en)),
        short_description: loc(shortVi.trim(), shortEn.trim()),
        nutrition_information: loc(nutritionVi.trim(), nutritionEn.trim()),
        description: descVi || descEn ? loc(descVi.trim(), descEn.trim()) : undefined,
        price: Number(price),
        sale_price: salePrice ? Number(salePrice) : undefined,
        images,
        variants: variantPayload.length > 0 ? variantPayload : undefined,
        stock_quantity: Number(stock) || 0,
        sku: sku.trim() || undefined,
        category_id: categoryId || undefined,
        brand_id: brandId || null,
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
          {/* Nội dung song ngữ dạng tab — ưu tiên Tiếng Việt; mở tab EN khi cần dịch. */}
          <div className="rounded-md border border-border p-3">
            <div className="mb-3 inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-sm font-semibold">
              {(['vi', 'en'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={
                    lang === l
                      ? 'rounded bg-white px-4 py-1.5 text-foreground shadow-sm'
                      : 'rounded px-4 py-1.5 text-muted-foreground hover:text-foreground'
                  }
                >
                  {l === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}
                </button>
              ))}
            </div>

            {lang === 'vi' ? (
              <div className="flex flex-col gap-4">
                <Field id="nameVi" label="Tên sản phẩm">
                  <Input id="nameVi" value={nameVi} onChange={(e) => changeNameVi(e.target.value)} />
                </Field>
                <Field id="slugVi" label="Slug" required={false} hint="Bỏ trống để tự sinh từ tên.">
                  <Input id="slugVi" value={slugVi} onChange={(e) => setSlugVi(e.target.value)} />
                </Field>
                <Field
                  id="shortVi"
                  label="Chất gây dị ứng (HTML)"
                  required={false}
                  hint="Ví dụ: <p>Có chứa <strong>sữa, đậu nành</strong>.</p>"
                >
                  <Textarea id="shortVi" rows={4} className="font-mono text-xs" value={shortVi} onChange={(e) => setShortVi(e.target.value)} />
                </Field>
                <Field id="nutritionVi" label="Thông tin dinh dưỡng (HTML)" required={false}>
                  <Textarea id="nutritionVi" rows={6} className="font-mono text-xs" value={nutritionVi} onChange={(e) => setNutritionVi(e.target.value)} />
                </Field>
                <Field id="descVi" label="Mô tả" required={false}>
                  <Textarea id="descVi" rows={4} value={descVi} onChange={(e) => setDescVi(e.target.value)} />
                </Field>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Field id="nameEn" label="Product name" required={false} hint="Tự điền theo tiếng Việt — sửa nếu muốn bản dịch riêng.">
                  <Input id="nameEn" value={nameEn} onChange={(e) => changeNameEn(e.target.value)} />
                </Field>
                <Field id="slugEn" label="Slug" required={false} hint="Bỏ trống để tự sinh.">
                  <Input id="slugEn" value={slugEn} onChange={(e) => setSlugEn(e.target.value)} />
                </Field>
                <Field id="shortEn" label="Allergen information (HTML)" required={false}>
                  <Textarea id="shortEn" rows={4} className="font-mono text-xs" value={shortEn} onChange={(e) => setShortEn(e.target.value)} />
                </Field>
                <Field id="nutritionEn" label="Nutrition information (HTML)" required={false}>
                  <Textarea id="nutritionEn" rows={6} className="font-mono text-xs" value={nutritionEn} onChange={(e) => setNutritionEn(e.target.value)} />
                </Field>
                <Field id="descEn" label="Description" required={false}>
                  <Textarea id="descEn" rows={4} value={descEn} onChange={(e) => setDescEn(e.target.value)} />
                </Field>
              </div>
            )}
          </div>
          <Field id="images" label="Ảnh sản phẩm" required={false}>
            <MultiImageUpload value={images} onChange={setImages} folder="products" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="price" label="Giá (VND)"><Input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} /></Field>
            <Field id="sale" label="Giá KM" required={false}><Input id="sale" type="number" min={0} value={salePrice} onChange={(e) => setSalePrice(e.target.value)} /></Field>
            <Field id="stock" label="Tồn kho" required={false}><Input id="stock" type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="sku" label="SKU" required={false}><Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} /></Field>
            <Field id="category" label="Danh mục" required={false}>
              <NativeSelect id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">— Không —</option>
                {categoryOptions.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </NativeSelect>
            </Field>
            <Field id="brand" label="Thương hiệu" required={false}>
              <NativeSelect id="brand" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                <option value="">— Không có thương hiệu —</option>
                {brandOptions.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}{brand.is_active ? '' : ' (đang ẩn)'}
                  </option>
                ))}
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
          {/* Biến thể theo quy cách (size). Mỗi variant = 1 quy cách + giá + tồn riêng. */}
          <div className="rounded-md border border-border p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Biến thể theo quy cách</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVariants((prev) => [...prev, { size_id: '', sku: '', price: price || 0, stock: 0 }])}
              >
                <Plus className="size-4" /> Thêm biến thể
              </Button>
            </div>
            {variants.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Chưa có biến thể — sản phẩm bán theo giá/tồn chung ở trên. Thêm biến thể nếu bán nhiều quy cách (24 cây/thùng, Hộp 250ml…).
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-2">
                    <NativeSelect
                      value={v.size_id}
                      onChange={(e) => setVariants((prev) => prev.map((x, idx) => (idx === i ? { ...x, size_id: e.target.value } : x)))}
                      aria-label="Quy cách"
                    >
                      <option value="">— Quy cách —</option>
                      {sizeOptions.map((s) => (<option key={s.id} value={s.id}>{packagingLabel(s)}</option>))}
                    </NativeSelect>
                    <Input
                      placeholder="SKU"
                      value={v.sku}
                      onChange={(e) => setVariants((prev) => prev.map((x, idx) => (idx === i ? { ...x, sku: e.target.value } : x)))}
                    />
                    <Input
                      type="number" min={0} placeholder="Giá" className="w-24"
                      value={v.price}
                      onChange={(e) => setVariants((prev) => prev.map((x, idx) => (idx === i ? { ...x, price: Number(e.target.value) } : x)))}
                    />
                    <Input
                      type="number" min={0} placeholder="Tồn" className="w-20"
                      value={v.stock}
                      onChange={(e) => setVariants((prev) => prev.map((x, idx) => (idx === i ? { ...x, stock: Number(e.target.value) } : x)))}
                    />
                    <Button variant="ghost" size="icon" aria-label="Xoá biến thể" onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {sizeOptions.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Chưa có quy cách nào — tạo ở mục “Quy cách” trước.</p>
            ) : null}
          </div>
        </div>
      )}
    </Dialog>
  );
}
