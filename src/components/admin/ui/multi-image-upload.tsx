'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { filesControllerUploadFile } from '@/lib/api/generated/files/files';
import { useToast } from './toast';

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

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  max?: number;
}

/** Upload nhiều ảnh (grid) — thêm/xoá từng ảnh; giữ thứ tự. */
export function MultiImageUpload({ value, onChange, folder, max = 5 }: MultiImageUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    const room = max - value.length;
    if (room <= 0) {
      toast({ title: `Tối đa ${max} ảnh`, tone: 'error' });
      return;
    }
    setUploading(true);
    try {
      const picked = Array.from(files).slice(0, room);
      const urls: string[] = [];
      for (const file of picked) {
        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) continue;
        const res = await filesControllerUploadFile({ file, folder });
        const url = extractUrl(res);
        if (url) urls.push(url);
      }
      if (urls.length) onChange([...value, ...urls]);
    } catch {
      toast({ title: 'Upload ảnh thất bại', tone: 'error' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-wrap gap-3">
      {value.map((url, i) => (
        <div key={url} className="relative size-20 overflow-hidden rounded-lg border border-border bg-muted">
          <Image src={url} alt="" fill className="object-cover" sizes="80px" />
          <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">{i + 1}</span>
          <button
            type="button"
            onClick={() => removeAt(i)}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
            aria-label="Xoá ảnh"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
      {value.length < max ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-white text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          <span className="text-[10px]">Thêm</span>
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
