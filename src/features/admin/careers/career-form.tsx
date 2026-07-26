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
import type { CareerDto, CreateCareerDtoStatus } from '@/lib/api/generated/ecomAPI.schemas';
import { createCareer, updateCareer } from './api';

interface CareerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  career: CareerDto | null;
  onSaved: () => void;
}

const STATUSES: { value: CreateCareerDtoStatus; label: string }[] = [
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Đã đăng' },
  { value: 'closed', label: 'Đã đóng' },
];

export function CareerForm({ open, onOpenChange, career, onSaved }: CareerFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<CreateCareerDtoStatus>('draft');
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setTitle(career?.title ?? '');
    setSlug(career?.slug ?? '');
    setCategory(career?.category ?? '');
    setLocation(career?.location ?? '');
    setLevel(career?.level ?? '');
    setContent(career?.content ?? '');
    setCoverUrl(career?.cover_url || null);
    setStatus(career?.status ?? 'draft');
    setIsPrimary(career?.is_primary ?? false);
  }, [open, career]);

  const onSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugify(title) || undefined,
        category: category.trim() || undefined,
        location: location.trim() || undefined,
        level: level.trim() || undefined,
        content,
        cover_url: coverUrl || undefined,
        status,
        is_primary: isPrimary,
      };
      if (career) {
        await updateCareer(career.id, payload);
        toast({ title: 'Đã cập nhật tin tuyển dụng', tone: 'success' });
      } else {
        await createCareer(payload);
        toast({ title: 'Đã tạo tin tuyển dụng', tone: 'success' });
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
      title={career ? 'Sửa tin tuyển dụng' : 'Thêm tin tuyển dụng'}
      className="max-w-2xl"
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
        <Field id="title" label="Tiêu đề">
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => !slug && setSlug(slugify(title))} />
        </Field>
        <Field id="slug" label="Slug" hint="Bỏ trống để tự sinh từ tiêu đề.">
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="category" label="Bộ phận" required={false}>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="vd: Sản xuất" />
          </Field>
          <Field id="location" label="Địa điểm" required={false}>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="vd: TP.HCM" />
          </Field>
          <Field id="level" label="Cấp bậc" required={false}>
            <Input id="level" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="vd: Nhân viên" />
          </Field>
        </div>
        <Field id="content" label="Nội dung (HTML)" error={error ?? undefined}>
          <Textarea id="content" rows={8} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-xs" />
        </Field>
        <Field id="cover" label="Ảnh bìa" required={false}>
          <ImageUpload value={coverUrl} onChange={setCoverUrl} folder="careers" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="status" label="Trạng thái" required={false}>
            <NativeSelect id="status" value={status} onChange={(e) => setStatus(e.target.value as CreateCareerDtoStatus)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </NativeSelect>
          </Field>
          <div className="flex items-end gap-3 pb-2">
            <Switch id="primary" checked={isPrimary} onCheckedChange={setIsPrimary} />
            <label htmlFor="primary" className="text-sm font-semibold text-foreground">
              Ghim (tin nổi bật)
            </label>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
