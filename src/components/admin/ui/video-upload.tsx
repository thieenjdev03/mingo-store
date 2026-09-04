'use client';

import { useEffect, useRef, useState } from 'react';
import { Film, Loader2, X } from 'lucide-react';
import { filesControllerUploadFile } from '@/lib/api/generated/files/files';
import { cn } from '@/lib/utils';
import { buildYouTubeEmbedUrl } from '@/lib/media/youtube';
import { Input } from './input';
import { useToast } from './toast';

/** Lấy URL từ response Cloudinary (backend có thể trả secure_url/url/string). */
function extractUrl(res: unknown): string | null {
  if (typeof res === 'string') return res;
  if (res && typeof res === 'object') {
    const o = res as Record<string, unknown>;
    for (const key of ['secure_url', 'url', 'video_url', 'path']) {
      if (typeof o[key] === 'string') return o[key] as string;
    }
  }
  return null;
}

interface VideoUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Thư mục Cloudinary, vd 'homepage/banners'. */
  folder: string;
  className?: string;
}

const MAX_MB = 50;

/** Upload 1 video (mp4) hoặc nhận link video/YouTube, trả URL tuyệt đối. */
export function VideoUpload({ value, onChange, folder, className }: VideoUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value ?? '');

  useEffect(() => {
    setUrlDraft(value ?? '');
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({ title: 'Chỉ chấp nhận video', tone: 'error' });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ title: `Video vượt quá ${MAX_MB}MB`, tone: 'error' });
      return;
    }
    setUploading(true);
    try {
      const res = await filesControllerUploadFile({ file, folder, resourceType: 'video' });
      const url = extractUrl(res);
      if (!url) throw new Error('no url');
      onChange(url);
    } catch {
      toast({ title: 'Upload video thất bại', tone: 'error' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const applyVideoUrl = () => {
    const nextUrl = urlDraft.trim();
    if (!nextUrl) {
      onChange(null);
      return;
    }
    try {
      const parsed = new URL(nextUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('unsupported protocol');
      onChange(nextUrl);
    } catch {
      toast({ title: 'Link video không hợp lệ', tone: 'error' });
    }
  };

  const youtubeEmbedUrl = value ? buildYouTubeEmbedUrl(value) : null;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="relative flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
        {value ? (
          <>
            {youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                title="Video banner"
                className="pointer-events-none size-full"
                allow="autoplay; encrypted-media"
              />
            ) : (
              <video src={value} muted playsInline className="size-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white hover:bg-black/80"
              aria-label="Xoá video"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <Film className="size-7 text-muted-foreground" />
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
          className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          {value ? 'Đổi video' : 'Tải video lên'}
        </button>
        <p className="mt-1 text-xs text-muted-foreground">MP4, tối đa {MAX_MB}MB hoặc dán link YouTube.</p>
        <div className="mt-2 flex max-w-[360px] gap-2">
          <Input
            id="video-url"
            type="url"
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyVideoUrl();
              }
            }}
            placeholder="Dán link YouTube"
            aria-label="Link YouTube"
          />
          <button
            type="button"
            onClick={applyVideoUrl}
            disabled={uploading}
            className="shrink-0 rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            Dùng link
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
