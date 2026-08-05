'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
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
  const [showOnHome, setShowOnHome] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(collection?.name ?? '');
    setSlug(collection?.slug ?? '');
    setDescription(collection?.description ?? '');
    setShowOnHome((collection?.homepage_section?.trim() ?? '') !== '');
    setIsActive(collection?.is_active ?? true);
  }, [open, collection]);

  const onSubmit = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên.');
      return;
    }
    setSaving(true);
    try {
      const resolvedSlug = slug.trim() || slugify(name);
      // Bật "hiển thị trang chủ" => mã khối trang chủ tự lấy theo slug (duy nhất).
      const marker = showOnHome ? resolvedSlug : '';
      const payload = {
        name: name.trim(),
        slug: resolvedSlug || undefined,
        description: description.trim() || undefined,
        homepage_section: marker,
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
        <Field id="desc" label="Mô tả" required={false} error={error ?? undefined}>
          <Textarea id="desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <div className="flex items-center gap-3">
          <Switch id="showOnHome" checked={showOnHome} onCheckedChange={setShowOnHome} />
          <label htmlFor="showOnHome" className="text-sm font-semibold text-foreground">
            Hiển thị trên trang chủ
          </label>
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
