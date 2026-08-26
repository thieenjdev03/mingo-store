'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Dialog } from '@/components/admin/ui/dialog';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
import { MultiImageUpload } from '@/components/admin/ui/multi-image-upload';
import { ImageUpload } from '@/components/admin/ui/image-upload';
import { useToast } from '@/components/admin/ui/toast';
import { Plus, Trash2 } from 'lucide-react';
import { slugify } from '@/lib/admin/slugify';
import { getCategoryOptions } from '@/features/admin/shared/options';
import { brandsKey, listBrands } from '@/features/admin/brands/api';
import { listSizes } from '@/features/admin/sizes/api';
import { packagingLabel } from '@/features/product/types';
import { fCurrencyVND } from '@/lib/format';
import { ApiError } from '@/lib/api/fetcher';
import { getApiErrorMessages } from '@/lib/api/error-message';
import type { CreateProductDtoStatus } from '@/lib/api/generated/ecomAPI.schemas';
import { getProductForEdit, createProduct, updateProduct } from './api';

interface VariantRow {
  name: string;
  size_id: string;
  sku: string;
  price: string;
  stock: number;
  image_url: string | null;
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
  onSaved: () => void;
}

const STATUSES: { value: CreateProductDtoStatus; label: string }[] = [
  { value: 'active', label: 'Đăng bán' },
  { value: 'draft', label: 'Nháp' },
  { value: 'inactive', label: 'Ẩn' },
];

const LEGACY_STATUS_LABEL: Record<string, string> = {
  active: 'Đăng bán',
  draft: 'Nháp',
  inactive: 'Ẩn',
  out_of_stock: 'Hết hàng (dữ liệu cũ)',
  discontinued: 'Ngừng bán (dữ liệu cũ)',
};

const normalizeStatus = (value: CreateProductDtoStatus | null | undefined): CreateProductDtoStatus =>
  value === 'draft' || value === 'inactive' ? value : 'active';

/** Chỉ loại bỏ các thẻ có thể thực thi khi render bản xem trước cục bộ. Backend vẫn sanitize lần cuối. */
const sanitizePreviewHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\s+(?:href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

/** Giữ lại chữ số để field giá cho nhập tự do (không stepper), rỗng khi chưa nhập. */
const onlyDigits = (value: string) => value.replace(/[^\d]/g, '');

interface ProductPreviewProps {
  name: string;
  images: string[];
  price: number;
  salePrice: string;
  status: CreateProductDtoStatus;
  variants: VariantRow[];
  sizeOptions: Array<{ id: string; name: string }>;
  description: string;
  shortDescription: string;
  usage: string;
  notes: string;
}

function ProductPreview({
  name,
  images,
  price,
  salePrice,
  status,
  variants,
  sizeOptions,
  description,
  shortDescription,
  usage,
  notes,
}: ProductPreviewProps) {
  const renderedPrice = salePrice ? Number(salePrice) : price;
  const statusLabel = LEGACY_STATUS_LABEL[status] ?? status;
  const richFields = [
    { label: 'Mô tả', value: description },
    { label: 'Thành phần & chất gây dị ứng', value: shortDescription },
    { label: 'Hướng dẫn sử dụng', value: usage },
    { label: 'Chú ý', value: notes },
  ];

  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bản xem trước</p>
          <h2 className="text-lg font-bold text-foreground">Sản phẩm trước khi lưu</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{statusLabel}</span>
      </div>

      <div className="grid gap-5 md:grid-cols-[180px_1fr]">
        <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted/30">
          {images[0] ? (
            <img src={images[0]} alt={name || 'Ảnh sản phẩm'} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-4xl" aria-label="Chưa có ảnh sản phẩm">🍦</div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="text-xl font-bold text-foreground">{name || 'Chưa nhập tên sản phẩm'}</h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{fCurrencyVND(renderedPrice || 0)}</span>
            {salePrice && Number(salePrice) < price ? (
              <span className="text-sm text-muted-foreground line-through">{fCurrencyVND(price)}</span>
            ) : null}
          </div>

          {variants.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {variants.map((variant, index) => {
                const sizeName = variant.name || (sizeOptions.find((size) => size.id === variant.size_id)?.name ?? variant.sku) || `Biến thể ${index + 1}`;
                return (
                  <span key={`${variant.sku}-${index}`} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                    {sizeName} · {fCurrencyVND(Number(variant.price) || price)} · còn {variant.stock}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
        {richFields.map((field) => (
          <section key={field.label} className="min-w-0">
            <h4 className="mb-1 text-sm font-semibold text-foreground">{field.label}</h4>
            {field.value ? (
              <div
                className="prose prose-sm max-w-none text-sm text-muted-foreground [&_a]:text-primary [&_img]:max-h-40 [&_img]:rounded [&_li]:ml-4 [&_ol]:list-decimal [&_p]:my-1 [&_strong]:font-semibold [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(field.value) }}
              />
            ) : (
              <p className="text-sm italic text-muted-foreground">Chưa nhập nội dung</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

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
  const [usageVi, setUsageVi] = useState(''); const [usageEn, setUsageEn] = useState('');
  const [descVi, setDescVi] = useState(''); const [descEn, setDescEn] = useState('');
  const [notesVi, setNotesVi] = useState(''); const [notesEn, setNotesEn] = useState('');
  const [price, setPrice] = useState('');
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
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Khi có biến thể theo quy cách, tồn kho sản phẩm = tổng tồn các quy cách (không nhập tay).
  const hasVariants = variants.length > 0;
  const variantStockTotal = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const effectiveStock = hasVariants ? variantStockTotal : stock;

  // Giá sản phẩm chỉ bắt buộc với sản phẩm đơn không báo giá. Khi có biến thể (giá quản lý theo
  // từng quy cách) HOẶC bật "LH Báo Giá" (isFeatured => storefront ẩn giá) thì giá gốc là tuỳ chọn.
  const priceRequired = !hasVariants && !isFeatured;

  // Quy cách phù hợp với danh mục sản phẩm: quy cách dùng chung (không gắn danh mục)
  // + quy cách gắn đúng danh mục đang chọn. Quy cách của danh mục khác bị loại khỏi dropdown.
  const availableSizes = sizeOptions.filter(
    (s) => s.categories.length === 0 || (categoryId !== '' && s.categories.some((c) => c.id === categoryId)),
  );
  // Với 1 dòng biến thể: luôn kèm quy cách đang chọn kể cả khi nằm ngoài phạm vi hiện tại
  // (vd đổi danh mục sau khi đã chọn quy cách) để không âm thầm mất giá trị đã lưu.
  const sizeOptionsForRow = (sizeId: string) => {
    if (sizeId && !availableSizes.some((s) => s.id === sizeId)) {
      const current = sizeOptions.find((s) => s.id === sizeId);
      if (current) return [...availableSizes, current];
    }
    return availableSizes;
  };

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
    setErrors([]);
    setLang('vi');
    setPreviewOpen(false);
    if (productId && editData) {
      setNameEnEdited(!!editData.name.en);
      setNameVi(editData.name.vi); setNameEn(editData.name.en);
      setSlugVi(editData.slug.vi); setSlugEn(editData.slug.en);
      setShortVi(editData.short_description.vi); setShortEn(editData.short_description.en);
      setUsageVi(editData.usage_instructions.vi); setUsageEn(editData.usage_instructions.en);
      setDescVi(editData.description.vi); setDescEn(editData.description.en);
      setNotesVi(editData.notes.vi); setNotesEn(editData.notes.en);
      setPrice(editData.base.price != null ? String(editData.base.price) : '');
      setSalePrice(editData.base.sale_price != null ? String(editData.base.sale_price) : '');
      setStock(editData.base.stock_quantity ?? 0);
      setSku(editData.base.sku ?? '');
      setCategoryId(editData.base.category?.id ?? '');
      setBrandId(editData.base.brand?.id ?? '');
      setImages(editData.base.images ?? []);
      setStatus(normalizeStatus(editData.base.status as CreateProductDtoStatus | undefined));
      setIsFeatured(editData.base.is_featured ?? false);
      setEnableSaleTag(editData.base.enable_sale_tag ?? false);
      setVariants(
        (editData.base.variants ?? []).map((v) => ({
          name: typeof v.name === 'string' ? v.name : '',
          size_id: v.size_id ?? v.size?.id ?? '',
          sku: v.sku,
          price: v.price != null ? String(v.price) : '',
          stock: Number(v.stock) || 0,
          image_url: v.image_url ?? null,
        })),
      );
    } else if (!productId) {
      setNameEnEdited(false);
      setNameVi(''); setNameEn(''); setSlugVi(''); setSlugEn('');
      setShortVi(''); setShortEn(''); setUsageVi(''); setUsageEn(''); setDescVi(''); setDescEn(''); setNotesVi(''); setNotesEn('');
      setPrice(''); setSalePrice(''); setStock(0); setSku(''); setCategoryId(''); setBrandId('');
      setImages([]); setStatus('active'); setIsFeatured(false); setEnableSaleTag(false);
      setVariants([]);
    }
  }, [open, productId, editData]);

  const fail = (messages: string | string[]) => {
    // Thoát chế độ xem trước để dải lỗi ở đầu form luôn hiển thị.
    setPreviewOpen(false);
    setErrors(Array.isArray(messages) ? messages : [messages]);
  };

  const onSubmit = async () => {
    // Validate các field backend bắt buộc (CreateProductDto: name, slug, price;
    // ProductVariantDto: name, sku, price, stock) trước khi gọi API để báo lỗi sớm.
    const nm = { vi: nameVi.trim() || nameEn.trim(), en: nameEn.trim() || nameVi.trim() };
    if (!nm.vi && !nm.en) {
      fail('Cần nhập tên sản phẩm (ít nhất một ngôn ngữ).');
      return;
    }
    const slug = {
      vi: slugVi.trim() || slugify(nm.vi),
      en: slugEn.trim() || slugify(nm.en),
    };
    if (!slug.vi && !slug.en) {
      fail('Không tạo được slug từ tên sản phẩm — nhập slug thủ công.');
      return;
    }
    if (priceRequired && (!price.trim() || Number(price) <= 0)) {
      fail('Giá phải lớn hơn 0.');
      return;
    }
    if (price.trim() && Number(price) <= 0) {
      fail('Giá phải lớn hơn 0.');
      return;
    }
    if (salePrice && Number(price) > 0 && (Number(salePrice) <= 0 || Number(salePrice) >= Number(price))) {
      fail('Giá khuyến mãi phải lớn hơn 0 và nhỏ hơn giá gốc.');
      return;
    }
    // LH Báo Giá: storefront ẩn giá nên biến thể không cần giá; các trường hợp khác vẫn bắt buộc.
    if (!isFeatured && variants.some((v) => !v.price.trim() || Number(v.price) <= 0)) {
      fail('Giá của mỗi biến thể phải lớn hơn 0.');
      return;
    }
    if (variants.some((v) => !v.name.trim() || !v.size_id || !v.sku.trim())) {
      fail('Mỗi biến thể cần nhập tên, chọn quy cách và nhập SKU.');
      return;
    }
    if (variants.some((v) => Number(v.price) < 0 || Number(v.stock) < 0)) {
      fail('Giá và tồn kho của biến thể không được âm.');
      return;
    }
    setErrors([]);
    setSaving(true);
    try {
      const variantPayload = variants.map((v) => {
        const sizeName = sizeOptions.find((s) => s.id === v.size_id)?.name ?? v.sku;
        const variantName = v.name.trim() || sizeName;
        return {
          name: { vi: variantName, en: variantName },
          sku: v.sku.trim(),
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          size_id: v.size_id,
          image_url: v.image_url || undefined,
        };
      });
      // Backend yêu cầu CreateProductDto.price (number). Khi bỏ trống giá gốc (có biến thể / LH báo giá),
      // dùng giá biến thể nhỏ nhất làm giá đại diện, nếu không có thì 0.
      const enteredPrice = Number(price) || 0;
      const minVariantPrice = variantPayload
        .map((v) => v.price)
        .filter((p) => p > 0)
        .reduce((min, p) => (p < min ? p : min), Infinity);
      const priceToSend =
        enteredPrice > 0 ? enteredPrice : Number.isFinite(minVariantPrice) ? minVariantPrice : 0;
      const loc = (vi: string, en: string) => ({ vi: vi || en, en: en || vi });
      const payload = {
        name: nm,
        slug,
        short_description: loc(shortVi.trim(), shortEn.trim()),
        usage_instructions: loc(usageVi.trim(), usageEn.trim()),
        description: descVi || descEn ? loc(descVi.trim(), descEn.trim()) : undefined,
        notes: loc(notesVi.trim(), notesEn.trim()),
        price: priceToSend,
        sale_price: salePrice ? Number(salePrice) : undefined,
        images,
        variants: variantPayload.length > 0 ? variantPayload : undefined,
        // Có biến thể => tồn kho do từng quy cách quản lý; backend từ chối nếu gửi kèm
        // stock_quantity ("Product with variants should not have stock_quantity set").
        stock_quantity: hasVariants ? undefined : Number(stock) || 0,
        // Có biến thể => SKU quản lý theo từng biến thể, không gửi SKU sản phẩm gốc.
        sku: hasVariants ? undefined : sku.trim() || undefined,
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
    } catch (err) {
      // Hiển thị đúng lỗi backend trả về (NestJS ValidationPipe: message string | string[]).
      const duplicateSku =
        err instanceof ApiError && err.status === 409
          ? 'SKU hoặc slug đã tồn tại — kiểm tra lại SKU sản phẩm/biến thể và slug.'
          : null;
      const messages = duplicateSku
        ? [duplicateSku]
        : getApiErrorMessages(err, 'Lưu sản phẩm thất bại. Vui lòng thử lại.');
      fail(messages);
      toast({
        title: 'Không thể lưu sản phẩm',
        description: messages.join(' '),
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={productId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      className="max-w-5xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => setPreviewOpen((current) => !current)}
            disabled={saving || (!!productId && loadingEdit)}
          >
            {previewOpen ? 'Chỉnh sửa' : 'Xem trước'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Huỷ</Button>
          <Button onClick={onSubmit} disabled={saving || (!!productId && loadingEdit)}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </>
      }
    >
      {productId && loadingEdit ? (
        <div className="py-5"><MeltingIceCreamLoader size="sm" /></div>
      ) : previewOpen ? (
        <ProductPreview
          name={lang === 'en' ? nameEn || nameVi : nameVi || nameEn}
          images={images}
          price={Number(price) || 0}
          salePrice={salePrice}
          status={status}
          variants={variants}
          sizeOptions={sizeOptions}
          description={lang === 'en' ? descEn || descVi : descVi || descEn}
          shortDescription={lang === 'en' ? shortEn || shortVi : shortVi || shortEn}
          usage={lang === 'en' ? usageEn || usageVi : usageVi || usageEn}
          notes={lang === 'en' ? notesEn || notesVi : notesVi || notesEn}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {errors.length > 0 ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              <p className="font-bold">Kiểm tra lại thông tin sản phẩm:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 font-normal">
                {errors.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}
              </ul>
            </div>
          ) : null}
          {/* Nội dung song ngữ dạng tab — ưu tiên Tiếng Việt; mở tab EN khi cần dịch. */}
          <div className="rounded-md border border-border p-3">
            <p className="mb-3 rounded-md bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              Các trường mô tả, thành phần &amp; chất gây dị ứng, hướng dẫn sử dụng và chú ý nhận HTML. Dùng các thẻ trình bày như <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>, <code>&lt;ul&gt;</code>; hệ thống sẽ lọc thẻ nguy hiểm trước khi lưu.
            </p>
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
                <Field id="nameVi" label="Tên sản phẩm" required>
                  <Input id="nameVi" value={nameVi} onChange={(e) => changeNameVi(e.target.value)} />
                </Field>
                <Field id="slugVi" label="Slug" required={false} hint="Bỏ trống để tự sinh từ tên.">
                  <Input id="slugVi" value={slugVi} onChange={(e) => setSlugVi(e.target.value)} />
                </Field>
                <Field id="descVi" label="Mô tả (HTML)" required={false} hint="Ví dụ: <p>Kem tươi vị vani, dùng ngon hơn khi để mềm 5 phút.</p>">
                  <Textarea id="descVi" rows={4} value={descVi} onChange={(e) => setDescVi(e.target.value)} />
                </Field>
                <Field
                  id="shortVi"
                  label="Thành phần & chất gây dị ứng (HTML)"
                  required={false}
                  hint="Ví dụ: <p>Có chứa <strong>sữa, đậu nành</strong>.</p>"
                >
                  <Textarea id="shortVi" rows={4} className="font-mono text-xs" value={shortVi} onChange={(e) => setShortVi(e.target.value)} />
                </Field>
                <Field id="usageVi" label="Hướng dẫn sử dụng (HTML)" required={false} hint="Ví dụ: <ol><li>Để kem mềm 5 phút trước khi dùng.</li><li>Dùng ngay sau khi mở hộp.</li></ol>">
                  <Textarea id="usageVi" rows={6} className="font-mono text-xs" value={usageVi} onChange={(e) => setUsageVi(e.target.value)} />
                </Field>
                <Field id="notesVi" label="Chú ý (HTML)" required={false} hint="Ví dụ: <ul><li>Bảo quản đông lạnh.</li><li>Không cấp đông lại sau khi rã đông.</li></ul>">
                  <Textarea id="notesVi" rows={4} className="font-mono text-xs" value={notesVi} onChange={(e) => setNotesVi(e.target.value)} />
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
                <Field id="descEn" label="Description (HTML)" required={false} hint="Example: <p>Fresh vanilla cream, best served after softening for 5 minutes.</p>">
                  <Textarea id="descEn" rows={4} value={descEn} onChange={(e) => setDescEn(e.target.value)} />
                </Field>
                <Field id="shortEn" label="Ingredients & allergen information (HTML)" required={false} hint="Example: <p>Contains <strong>milk and soy</strong>.</p>">
                  <Textarea id="shortEn" rows={4} className="font-mono text-xs" value={shortEn} onChange={(e) => setShortEn(e.target.value)} />
                </Field>
                <Field id="usageEn" label="Usage instructions (HTML)" required={false} hint="Example: <ol><li>Soften for 5 minutes before serving.</li><li>Consume immediately after opening.</li></ol>">
                  <Textarea id="usageEn" rows={6} className="font-mono text-xs" value={usageEn} onChange={(e) => setUsageEn(e.target.value)} />
                </Field>
                <Field id="notesEn" label="Notes (HTML)" required={false} hint="Example: <ul><li>Keep frozen.</li><li>Do not refreeze after thawing.</li></ul>">
                  <Textarea id="notesEn" rows={4} className="font-mono text-xs" value={notesEn} onChange={(e) => setNotesEn(e.target.value)} />
                </Field>
              </div>
            )}
          </div>
          <Field id="images" label="Ảnh sản phẩm" required={false}>
            <MultiImageUpload value={images} onChange={setImages} folder="products" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="price"
              label="Giá (VND)"
              required={priceRequired}
              hint={priceRequired ? undefined : hasVariants ? 'Có biến thể — giá quản lý theo từng quy cách, giá gốc tuỳ chọn.' : 'Đang bật LH Báo Giá — giá gốc tuỳ chọn (storefront ẩn giá).'}
            >
              <Input id="price" type="text" inputMode="numeric" placeholder={priceRequired ? 'Nhập giá' : 'Tuỳ chọn'} value={price} onChange={(e) => setPrice(onlyDigits(e.target.value))} />
            </Field>
            <Field id="sale" label="Giá KM" required={false}><Input id="sale" type="text" inputMode="numeric" placeholder="Nhập giá KM" value={salePrice} onChange={(e) => setSalePrice(onlyDigits(e.target.value))} /></Field>
            <Field
              id="stock"
              label="Tồn kho"
              required={false}
              hint={
                hasVariants
                  ? 'Tự tính từ tổng tồn các quy cách bên dưới — không sửa trực tiếp.'
                  : isFeatured
                    ? 'Đang bật LH Báo Giá — tồn kho không bắt buộc.'
                    : undefined
              }
            >
              <Input
                id="stock"
                type="number"
                min={0}
                disabled={hasVariants || isFeatured}
                value={effectiveStock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              id="sku"
              label="SKU"
              required={false}
              hint={hasVariants ? 'Có biến thể — SKU quản lý theo từng biến thể bên dưới.' : undefined}
            >
              <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} disabled={hasVariants} />
            </Field>
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
            <Field id="status" label="Trạng thái" required={false}>
              <NativeSelect id="status" value={status} onChange={(e) => setStatus(e.target.value as CreateProductDtoStatus)}>
                {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
              </NativeSelect>
            </Field>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-3">
              <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              <label htmlFor="featured" className="text-sm font-semibold text-foreground">LH Báo Giá</label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="saletag" checked={enableSaleTag} onCheckedChange={setEnableSaleTag} />
              <label htmlFor="saletag" className="text-sm font-semibold text-foreground">Hiện nhãn giảm giá</label>
            </div>
            {isFeatured ? (
              <p className="w-full text-xs text-muted-foreground">
                Bật <strong>LH Báo Giá</strong>: storefront sẽ ẩn giá và hiển thị “Liên hệ để nhận báo giá” thay cho giá bán.
                Giá và tồn kho (kể cả của biến thể) không bắt buộc nhập.
              </p>
            ) : null}
          </div>
          {/* Biến thể theo quy cách (size). Mỗi variant = 1 quy cách + giá + tồn riêng. */}
          <div className="rounded-md border border-border p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Biến thể theo quy cách</p>
              <Button
                variant="outline"
                size="sm"
                disabled={availableSizes.length === 0}
                onClick={() => setVariants((prev) => [...prev, { name: '', size_id: '', sku: '', price: price, stock: 0, image_url: null }])}
              >
                <Plus className="size-4" /> Thêm biến thể
              </Button>
            </div>
            {variants.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Chưa có biến thể — sản phẩm bán theo giá/tồn chung ở trên. Thêm biến thể nếu bán nhiều quy cách (24 cây/thùng, Hộp 250ml…).
              </p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[940px]">
                  {/* Tiêu đề cột — căn theo cùng grid template với các dòng biến thể bên dưới. */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_6rem_5rem_9rem_2.25rem] items-center gap-2 border-b border-border px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Tên biến thể</span>
                    <span>Quy cách</span>
                    <span>SKU</span>
                    <span>Giá (VND)</span>
                    <span>Tồn</span>
                    <span>Ảnh</span>
                    <span className="sr-only">Xoá</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    {variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_1fr_6rem_5rem_9rem_2.25rem] items-center gap-2">
                        <Input
                          placeholder="Tên biến thể"
                          aria-label="Tên biến thể"
                          value={v.name}
                          onChange={(e) => setVariants((prev) => prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
                        />
                        <NativeSelect
                          value={v.size_id}
                          onChange={(e) => {
                            const sizeId = e.target.value;
                            const suggestedName = sizeOptions.find((size) => size.id === sizeId)?.name ?? '';
                            setVariants((prev) => prev.map((x, idx) => (
                              idx === i
                                ? { ...x, size_id: sizeId, name: x.name.trim() ? x.name : suggestedName }
                                : x
                            )));
                          }}
                          aria-label="Quy cách"
                        >
                          <option value="">— Quy cách —</option>
                          {sizeOptionsForRow(v.size_id).map((s) => (<option key={s.id} value={s.id}>{packagingLabel(s)}</option>))}
                        </NativeSelect>
                        <Input
                          placeholder="SKU"
                          aria-label="SKU"
                          value={v.sku}
                          onChange={(e) => setVariants((prev) => prev.map((x, idx) => (idx === i ? { ...x, sku: e.target.value } : x)))}
                        />
                        <Input
                          type="text" inputMode="numeric" placeholder={isFeatured ? 'Tuỳ chọn' : 'Giá'} aria-label="Giá"
                          value={v.price}
                          onChange={(e) => setVariants((prev) => prev.map((x, idx) => (idx === i ? { ...x, price: onlyDigits(e.target.value) } : x)))}
                        />
                        <Input
                          type="number" min={0} placeholder="Tồn" aria-label="Tồn"
                          value={v.stock}
                          onChange={(e) => setVariants((prev) => prev.map((x, idx) => (idx === i ? { ...x, stock: Number(e.target.value) } : x)))}
                        />
                        <ImageUpload
                          compact
                          value={v.image_url}
                          folder="products/variants"
                          onChange={(imageUrl) => setVariants((prev) => prev.map((x, idx) => (idx === i ? { ...x, image_url: imageUrl } : x)))}
                        />
                        <Button variant="ghost" size="icon" aria-label="Xoá biến thể" onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {sizeOptions.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Chưa có quy cách nào — tạo ở mục “Quy cách” trước.</p>
            ) : !categoryId ? (
              <p className="mt-2 text-xs text-muted-foreground">Chọn <strong>Danh mục</strong> cho sản phẩm để hiện quy cách riêng của danh mục (hiện chỉ liệt kê quy cách dùng chung).</p>
            ) : availableSizes.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Danh mục này chưa có quy cách phù hợp — thêm quy cách cho danh mục ở mục “Quy cách”, hoặc dùng quy cách dùng chung.</p>
            ) : null}
          </div>
        </div>
      )}
    </Dialog>
  );
}
