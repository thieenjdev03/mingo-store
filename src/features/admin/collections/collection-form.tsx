'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
import { ImageUpload } from '@/components/admin/ui/image-upload';
import { useToast } from '@/components/admin/ui/toast';
import { slugify } from '@/lib/admin/slugify';
import { createCollection, updateCollection, type CollectionItem } from './api';

interface CollectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: CollectionItem | null;
  onSaved: () => void;
}

export function CollectionForm({ open, onOpenChange, collection, onSaved }: CollectionFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState<string | null>(null);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(collection?.name ?? '');
    setSlug(collection?.slug ?? '');
    setDescription(collection?.description ?? '');
    setBanner(collection?.banner_image_url || null);
    setSeoTitle(collection?.seo_title ?? '');
    setSeoDescription(collection?.seo_description ?? '');
    setIsActive(collection?.is_active ?? true);
  }, [open, collection]);

  const onSubmit = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: (slug.trim() || slugify(name)) || undefined,
        description: description.trim() || undefined,
        banner_image_url: banner || undefined,
        seo_title: seoTitle.trim() || undefined,
        seo_description: seoDescription.trim() || undefined,
        is_active: isActive,
      };
      if (collection) {
        await updateCollection(collection.id, payload);
        toast({ title: 'Đã cập nhật bộ sưu tập', tone: 'success' });
      } else {
        await createCollection(payload);
        toast({ title: 'Đã tạo bộ sưu tập', tone: 'success' });
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
      title={collection ? 'Sửa bộ sưu tập' : 'Thêm bộ sưu tập'}
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
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => !slug && setSlug(slugify(name))} />
        </Field>
        <Field id="slug" label="Slug" hint="Bỏ trống để tự sinh từ tên.">
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <Field id="desc" label="Mô tả" required={false}>
          <Textarea id="desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field id="banner" label="Ảnh banner" required={false}>
          <ImageUpload value={banner} onChange={setBanner} folder="collections" />
        </Field>
        <Field id="seoTitle" label="SEO title" required={false}>
          <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </Field>
        <Field id="seoDesc" label="SEO description" required={false} error={error ?? undefined}>
          <Textarea id="seoDesc" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </Field>
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
