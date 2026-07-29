'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
import { ImageUpload } from '@/components/admin/ui/image-upload';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { useToast } from '@/components/admin/ui/toast';
import { slugify } from '@/lib/admin/slugify';
import { createCollection, updateCollection, type CollectionItem, type CollectionPlacement } from './api';

const PLACEMENTS: { value: CollectionPlacement; label: string; hint: string }[] = [
  { value: 'NORMAL', label: 'Không hiện trang chủ', hint: 'Chỉ dùng như bộ sưu tập thường.' },
  { value: 'HERO', label: 'Banner đầu trang (Hero)', hint: 'Cần ảnh banner. Hiện trong carousel đầu trang chủ.' },
  { value: 'HOME_SECTION', label: 'Khối sản phẩm trang chủ', hint: 'Cần chọn khối bên dưới và gán sản phẩm.' },
];

/** Khối trang chủ mà storefront đang render (mingo-home-view lọc theo đúng các giá trị này). */
const HOMEPAGE_SECTIONS = [{ value: 'must_try', label: 'Must try' }];

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
  const [mobileBanner, setMobileBanner] = useState<string | null>(null);
  const [ctaLabel, setCtaLabel] = useState('');
  const [placement, setPlacement] = useState<CollectionPlacement>('NORMAL');
  const [homepageSection, setHomepageSection] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
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
    setMobileBanner(collection?.mobile_banner_image_url || null);
    setCtaLabel(collection?.cta_label ?? '');
    setPlacement(collection?.placement ?? 'NORMAL');
    setHomepageSection(collection?.homepage_section ?? '');
    setSortOrder(String(collection?.sort_order ?? 0));
    setSeoTitle(collection?.seo_title ?? '');
    setSeoDescription(collection?.seo_description ?? '');
    setIsActive(collection?.is_active ?? true);
  }, [open, collection]);

  const onSubmit = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên.');
      return;
    }
    // Chặn 2 cấu hình im lặng không hiển thị gì trên trang chủ.
    if (placement === 'HERO' && !banner) {
      setError('Banner đầu trang cần có ảnh banner.');
      return;
    }
    if (placement === 'HOME_SECTION' && !homepageSection) {
      setError('Vui lòng chọn khối trang chủ.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: (slug.trim() || slugify(name)) || undefined,
        description: description.trim() || undefined,
        banner_image_url: banner || undefined,
        mobile_banner_image_url: mobileBanner || undefined,
        cta_label: ctaLabel.trim() || undefined,
        placement,
        // Chỉ khối trang chủ mới giữ homepage_section; đổi sang vị trí khác thì gỡ ra.
        homepage_section: placement === 'HOME_SECTION' ? homepageSection : '',
        sort_order: Number(sortOrder) || 0,
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

        <Field
          id="placement"
          label="Hiển thị trang chủ"
          required={false}
          hint={PLACEMENTS.find((p) => p.value === placement)?.hint}
        >
          <NativeSelect
            id="placement"
            value={placement}
            onChange={(e) => setPlacement(e.target.value as CollectionPlacement)}
          >
            {PLACEMENTS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </NativeSelect>
        </Field>

        {placement === 'HOME_SECTION' ? (
          <Field id="homepageSection" label="Khối trang chủ" required={false}>
            <NativeSelect id="homepageSection" value={homepageSection} onChange={(e) => setHomepageSection(e.target.value)}>
              <option value="">— Chọn khối —</option>
              {HOMEPAGE_SECTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </NativeSelect>
          </Field>
        ) : null}

        {placement === 'HERO' ? (
          <>
            <Field id="mobileBanner" label="Ảnh banner (mobile)" required={false} hint="Bỏ trống sẽ dùng chung ảnh banner desktop.">
              <ImageUpload value={mobileBanner} onChange={setMobileBanner} folder="collections" />
            </Field>
            <Field id="ctaLabel" label="Nhãn nút CTA" required={false} hint='Bỏ trống sẽ dùng mặc định ("Xem sản phẩm").'>
              <Input id="ctaLabel" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Khám phá ngay" />
            </Field>
          </>
        ) : null}

        {placement !== 'NORMAL' ? (
          <Field id="sortOrder" label="Thứ tự" required={false} hint="Số nhỏ hiển thị trước.">
            <Input id="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </Field>
        ) : null}

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
