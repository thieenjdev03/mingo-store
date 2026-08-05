'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
import { ImageUpload } from '@/components/admin/ui/image-upload';
import { useToast } from '@/components/admin/ui/toast';
import { slugify } from '@/lib/admin/slugify';
import { createCategory, updateCategory, categoryParentId, type CategoryItem } from './api';

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryItem | null;
  allCategories: CategoryItem[];
  onSaved: () => void;
}

export function CategoryForm({ open, onOpenChange, category, allCategories, onSaved }: CategoryFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [parentId, setParentId] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(category?.name ?? '');
    setSlug(category?.slug ?? '');
    setDescription(category?.description ?? '');
    setImageUrl(category?.image_url || null);
    setParentId(category ? categoryParentId(category) ?? '' : '');
    setDisplayOrder(category?.display_order ?? 0);
    setIsActive(category?.is_active ?? true);
  }, [open, category]);

  const onSubmit = async () => {
    const finalSlug = (slug.trim() || slugify(name)).trim();
    if (!name.trim() || !finalSlug) {
      setError('Vui lòng nhập tên (và slug).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || undefined,
        image_url: imageUrl || undefined,
        parent_id: parentId || undefined,
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
      };
      if (category) {
        await updateCategory(category.id, payload);
        toast({ title: 'Đã cập nhật danh mục', tone: 'success' });
      } else {
        await createCategory(payload);
        toast({ title: 'Đã tạo danh mục', tone: 'success' });
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast({ title: 'Lưu thất bại', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Không cho chọn chính nó làm cha.
  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={category ? 'Sửa danh mục' : 'Thêm danh mục'}
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
        <Field id="name" label="Tên">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => !slug && setSlug(slugify(name))}
          />
        </Field>
        <Field id="slug" label="Slug" hint="Bỏ trống để tự sinh từ tên.">
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="vd: kem-que" />
        </Field>
        <Field id="desc" label="Mô tả" required={false}>
          <Textarea id="desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field id="image" label="Ảnh" required={false}>
          <ImageUpload value={imageUrl} onChange={setImageUrl} folder="categories" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Chọn danh mục cha chỉ hiển thị khi tạo mới; sửa danh mục thì ẩn đi. */}
          {!category ? (
            <Field id="parent" label="Danh mục cha" required={false}>
              <NativeSelect id="parent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">— Không có (cấp gốc) —</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </NativeSelect>
            </Field>
          ) : null}
          <Field id="order" label="Thứ tự" required={false}>
            <Input id="order" type="number" min={0} value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
          <label htmlFor="active" className="text-sm font-semibold text-foreground">
            Kích hoạt
          </label>
        </div>
      </div>
    </Dialog>
  );
}
