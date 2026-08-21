'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { filesControllerUploadFile } from '@/lib/api/generated/files/files';
import { cn } from '@/lib/utils';
import { useToast } from './toast';

/** Lấy URL ảnh từ response Cloudinary (backend có thể trả secure_url/url/string). */
function extractUrl(res: unknown): string | null {
  if (typeof res === 'string') return res;
  if (res && typeof res === 'object') {
    const o = res as Record<string, unknown>;
    for (const key of ['secure_url', 'url', 'image_url', 'path']) {
      if (typeof o[key] === 'string') return o[key] as string;
    }
  }
  return null;
}

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Thư mục Cloudinary, vd 'homepage/banners'. */
  folder: string;
  className?: string;
  /** Phiên bản gọn dùng trong bảng/danh sách nhiều dòng. */
  compact?: boolean;
}

/** Upload 1 ảnh lên Cloudinary qua /files/upload, trả về URL tuyệt đối. */
export function ImageUpload({ value, onChange, folder, className, compact = false }: ImageUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Chỉ chấp nhận ảnh', tone: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Ảnh vượt quá 5MB', tone: 'error' });
      return;
    }
    setUploading(true);
    try {
      const res = await filesControllerUploadFile({ file, folder });
      const url = extractUrl(res);
      if (!url) throw new Error('no url');
      onChange(url);
    } catch {
      toast({ title: 'Upload ảnh thất bại', tone: 'error' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-4', className)}>
      <div className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted', compact ? 'size-10' : 'size-24')}>
        {value ? (
          <>
            <Image src={value} alt="" fill className="object-cover" sizes={compact ? '40px' : '96px'} />
            <button
              type="button"
              onClick={() => onChange(null)}
              className={cn('absolute rounded-md bg-black/60 text-white hover:bg-black/80', compact ? 'right-0.5 top-0.5 p-0.5' : 'right-1 top-1 p-1')}
              aria-label="Xoá ảnh"
            >
              <X className={compact ? 'size-3' : 'size-3.5'} />
            </button>
          </>
        ) : (
          <ImagePlus className={cn('text-muted-foreground', compact ? 'size-5' : 'size-7')} />
        )}
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : null}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn('rounded-md border border-border bg-white font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60', compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm')}
        >
          {value ? 'Đổi ảnh' : 'Tải ảnh lên'}
        </button>
        {!compact ? <p className="mt-1 text-xs text-muted-foreground">PNG/JPG/WebP, tối đa 5MB.</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
