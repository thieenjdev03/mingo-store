'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
import { ImageUpload } from '@/components/admin/ui/image-upload';
import { VideoUpload } from '@/components/admin/ui/video-upload';
import { useToast } from '@/components/admin/ui/toast';
import { createBanner, updateBanner, type BannerDto } from './api';

interface BannerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: BannerDto | null;
  onSaved: () => void;
}

export function BannerForm({ open, onOpenChange, banner, onSaved }: BannerFormProps) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setImageUrl(banner?.image_url ?? null);
    setVideoUrl(banner?.video_url ?? null);
    setAltText(banner?.alt_text ?? '');
    setLinkUrl(banner?.link_url ?? '');
    setDisplayOrder(banner?.display_order ?? 0);
    setIsActive(banner?.is_active ?? true);
  }, [open, banner]);

  const onSubmit = async () => {
    if (!imageUrl && !videoUrl) {
      setError('Vui lòng tải ảnh banner hoặc video nền.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        // Gửi null (không phải undefined) để xoá media ở bản ghi đang sửa.
        image_url: imageUrl || null,
        video_url: videoUrl || null,
        alt_text: altText || undefined,
        link_url: linkUrl || undefined,
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
      };
      if (banner) {
        await updateBanner(banner.id, payload);
        toast({ title: 'Đã cập nhật banner', tone: 'success' });
      } else {
        await createBanner(payload);
        toast({ title: 'Đã tạo banner', tone: 'success' });
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
      title={banner ? 'Sửa banner' : 'Thêm banner'}
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
        <Field
          id="image"
          label="Ảnh banner"
          error={error ?? undefined}
          required={false}
          hint="Tuỳ chọn. Có thể dùng ảnh, video hoặc cả hai; ảnh sẽ làm poster khi có video."
        >
          <ImageUpload value={imageUrl} onChange={setImageUrl} folder="homepage/banners" />
        </Field>
        <Field
          id="video"
          label="Video nền (tuỳ chọn)"
          required={false}
          hint="MP4 hoặc link YouTube — storefront tự phát không tiếng và ẩn controller. Bỏ trống để dùng ảnh tĩnh."
        >
          <VideoUpload value={videoUrl} onChange={setVideoUrl} folder="homepage/banners" />
        </Field>
        <Field id="alt" label="Alt text" required={false}>
          <Input id="alt" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Mô tả ảnh (SEO/accessibility)" />
        </Field>
        <Field id="link" label="Link khi click" required={false}>
          <Input id="link" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/products hoặc URL" />
        </Field>
        <Field id="order" label="Thứ tự hiển thị" required={false} hint="Số nhỏ hiện trước.">
          <Input id="order" type="number" min={0} value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
        </Field>
        <div className="flex items-center gap-3">
          <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
          <label htmlFor="active" className="text-sm font-semibold text-foreground">
            Hiển thị trên trang chủ
          </label>
        </div>
      </div>
    </Dialog>
  );
}
