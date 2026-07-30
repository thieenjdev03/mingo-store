'use client';

import { useEffect, useState } from 'react';
import type { BrandDto, CreateBrandDto } from '@/lib/api/generated/ecomAPI.schemas';
import { ApiError } from '@/lib/api/fetcher';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { slugify } from '@/lib/admin/slugify';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
import { ImageUpload } from '@/components/admin/ui/image-upload';
import { useToast } from '@/components/admin/ui/toast';
import { createBrand, updateBrand } from './api';

interface BrandFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: BrandDto | null;
  onSaved: () => void;
}

export function BrandForm({ open, onOpenChange, brand, onSaved }: BrandFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(brand?.name ?? '');
    setSlug(brand?.slug ?? '');
    setLogoUrl(brand?.logo_url ?? null);
    setDescription(brand?.description ?? '');
    setDisplayOrder(brand?.display_order ?? 0);
    setIsActive(brand?.is_active ?? true);
    setFormError(null);
    setSlugError(null);
  }, [open, brand]);

  const onSubmit = async () => {
    const trimmedName = name.trim();
    const finalSlug = (slug.trim() || slugify(trimmedName)).trim();
    const order = Number(displayOrder);

    setFormError(null);
    setSlugError(null);
    if (!trimmedName) {
      setFormError('Vui lòng nhập tên thương hiệu.');
      return;
    }
    if (!finalSlug) {
      setSlugError('Vui lòng nhập slug hợp lệ.');
      return;
    }
    if (!Number.isInteger(order) || order < 0) {
      setFormError('Thứ tự hiển thị phải là số nguyên lớn hơn hoặc bằng 0.');
      return;
    }

    const payload: CreateBrandDto = {
      name: trimmedName,
      slug: finalSlug,
      logo_url: logoUrl,
      description: description.trim() || null,
      display_order: order,
      is_active: isActive,
    };

    setSaving(true);
    try {
      if (brand) {
        await updateBrand(brand.id, payload);
        toast({ title: 'Đã cập nhật thương hiệu', tone: 'success' });
      } else {
        await createBrand(payload);
        toast({ title: 'Đã tạo thương hiệu', tone: 'success' });
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSlugError('Slug này đã tồn tại hoặc đang được giữ bởi thương hiệu đã xoá.');
      } else {
        setFormError(getApiErrorMessage(error, 'Không thể lưu thương hiệu.'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={brand ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}
      description="Thông tin này được dùng cho storefront và liên kết với sản phẩm."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Huỷ
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field id="brand-name" label="Tên thương hiệu" required error={formError ?? undefined}>
          <Input
            id="brand-name"
            value={name}
            maxLength={255}
            onChange={(event) => {
              setName(event.target.value);
              setFormError(null);
            }}
            onBlur={() => {
              if (!slug) setSlug(slugify(name));
            }}
            placeholder="Ví dụ: Mingo"
          />
        </Field>

        <Field
          id="brand-slug"
          label="Slug"
          required
          hint="Tối đa 280 ký tự; phải duy nhất trong toàn hệ thống."
          error={slugError ?? undefined}
        >
          <Input
            id="brand-slug"
            value={slug}
            maxLength={280}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugError(null);
            }}
            placeholder="mingo"
          />
        </Field>

        <Field id="brand-logo" label="Logo" required={false}>
          <ImageUpload value={logoUrl} onChange={setLogoUrl} folder="brands" />
        </Field>

        <Field id="brand-description" label="Mô tả" required={false}>
          <Textarea
            id="brand-description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Mô tả ngắn về thương hiệu…"
          />
        </Field>

        <Field id="brand-order" label="Thứ tự hiển thị" required={false} hint="Số nhỏ được hiển thị trước.">
          <Input
            id="brand-order"
            type="number"
            min={0}
            step={1}
            value={displayOrder}
            onChange={(event) => setDisplayOrder(Number(event.target.value))}
          />
        </Field>

        <div className="flex items-center gap-3">
          <Switch id="brand-active" checked={isActive} onCheckedChange={setIsActive} />
          <label htmlFor="brand-active" className="text-sm font-semibold text-foreground">
            Hiển thị thương hiệu
          </label>
        </div>
      </div>
    </Dialog>
  );
}
