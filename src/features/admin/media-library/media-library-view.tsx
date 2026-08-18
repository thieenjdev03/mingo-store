'use client';

import Image from 'next/image';
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import useSWRInfinite from 'swr/infinite';
import { Check, Clipboard, FileSpreadsheet, ImagePlus, Loader2, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { PageHeader } from '@/components/admin/ui/page-header';
import { useToast } from '@/components/admin/ui/toast';
import { cn } from '@/lib/utils';
import { listMediaAssets, mediaLibraryKey, uploadMediaAssets } from './api';
import type { MediaAssetVM, MediaLibraryPageVM } from './types';

const MAX_FILES_PER_UPLOAD = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryView() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [productKey, setProductKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite<MediaLibraryPageVM>(
    (pageIndex, previousPage) => {
      if (pageIndex > 0 && !previousPage?.nextCursor) return null;
      return mediaLibraryKey(pageIndex === 0 ? null : previousPage?.nextCursor ?? null);
    },
    (key) => {
      const cursor = Array.isArray(key) ? key[2] : null;
      return listMediaAssets(typeof cursor === 'string' ? cursor : null);
    },
    { revalidateFirstPage: false },
  );

  const assets = useMemo(() => {
    const byId = new Map<string, MediaAssetVM>();
    data?.forEach((page) => page.items.forEach((asset) => byId.set(asset.publicId, asset)));
    return [...byId.values()];
  }, [data]);
  const selectedAssets = assets.filter((asset) => selectedIds.has(asset.publicId));
  const hasNextPage = Boolean(data?.[data.length - 1]?.nextCursor);

  function toggleAsset(publicId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(publicId)) next.delete(publicId);
      else next.add(publicId);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((current) =>
      current.size === assets.length
        ? new Set()
        : new Set(assets.map((asset) => asset.publicId)),
    );
  }

  async function upload(files: File[]) {
    const validFiles = files
      .filter((file) => file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE)
      .slice(0, MAX_FILES_PER_UPLOAD);
    if (validFiles.length === 0) {
      toast({ title: 'Không có ảnh hợp lệ', description: 'Chọn tối đa 10 ảnh, mỗi ảnh không quá 5MB.', tone: 'error' });
      return;
    }

    setUploading(true);
    try {
      await uploadMediaAssets(validFiles);
      await mutate();
      toast({ title: `Đã upload ${validFiles.length} ảnh`, tone: 'success' });
    } catch {
      toast({ title: 'Upload ảnh thất bại', tone: 'error' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void upload(Array.from(event.target.files));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!uploading) void upload(Array.from(event.dataTransfer.files));
  }

  async function copyUrls() {
    if (selectedAssets.length === 0) return;
    await copyText(selectedAssets.map((asset) => asset.url).join('\n'));
    toast({ title: `Đã copy ${selectedAssets.length} URL`, tone: 'success' });
  }

  async function copyForExcel() {
    const key = productKey.trim();
    if (!key) {
      toast({ title: 'Cần nhập product_key', description: 'Giá trị này dùng để nối ảnh với sản phẩm trong Excel.', tone: 'error' });
      return;
    }
    if (selectedAssets.length === 0) return;

    const rows = selectedAssets.map((asset, index) => `${key}\t${index + 1}\t${asset.url}`);
    await copyText(rows.join('\n'));
    toast({ title: `Đã copy ${rows.length} dòng cho Excel`, description: 'Dán vào cột A của sheet Product Images.', tone: 'success' });
  }

  return (
    <div>
      <PageHeader
        title="Thư viện ảnh"
        description="Upload ảnh sản phẩm, chọn nhiều ảnh và copy link để dùng trên storefront hoặc trong file import Excel."
        action={
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? 'Đang upload…' : 'Upload ảnh'}
          </Button>
        }
      />

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleInput} />

      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'mb-6 flex min-h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white px-6 py-5 text-center transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-border',
        )}
      >
        <ImagePlus className="mb-2 size-7 text-primary" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">Kéo thả ảnh vào đây hoặc dùng nút Upload ảnh</p>
        <p className="mt-1 text-xs text-muted-foreground">Tối đa 10 ảnh mỗi lần, không quá 5MB/ảnh.</p>
      </div>

      <section className="mb-6 rounded-lg border border-border bg-white p-4" aria-label="Công cụ sao chép ảnh">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="media-product-key" className="mb-1.5 block text-xs font-bold text-foreground">product_key trong Excel</label>
            <Input
              id="media-product-key"
              value={productKey}
              onChange={(event) => setProductKey(event.target.value)}
              placeholder="Ví dụ: creme-caramel-65g"
            />
          </div>
          <Button variant="outline" onClick={copyUrls} disabled={selectedAssets.length === 0}>
            <Clipboard className="size-4" /> Copy URL ({selectedAssets.length})
          </Button>
          <Button onClick={copyForExcel} disabled={selectedAssets.length === 0}>
            <FileSpreadsheet className="size-4" /> Copy cho Excel ({selectedAssets.length})
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          “Copy cho Excel” tạo 3 cột: product_key, sort_order, image_url. Dán trực tiếp vào cột A của sheet Product Images.
        </p>
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {assets.length} ảnh · đã chọn {selectedAssets.length}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleAll} disabled={assets.length === 0}>
            {selectedIds.size === assets.length && assets.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void mutate()} disabled={isValidating}>
            <RefreshCw className={cn('size-4', isValidating && 'animate-spin')} /> Làm mới
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid min-h-64 place-items-center rounded-lg border border-border bg-white">
          <Loader2 className="size-7 animate-spin text-primary" aria-label="Đang tải ảnh" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-white p-8 text-center">
          <p className="text-sm text-destructive">Không tải được thư viện ảnh.</p>
          <Button className="mt-4" variant="outline" onClick={() => void mutate()}>Thử lại</Button>
        </div>
      ) : assets.length === 0 ? (
        <div className="grid min-h-64 place-items-center rounded-lg border border-border bg-white text-center">
          <div>
            <ImagePlus className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">Chưa có ảnh trong folder products</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
          {assets.map((asset) => {
            const selected = selectedIds.has(asset.publicId);
            return (
              <label
                key={asset.publicId}
                className={cn(
                  'group cursor-pointer overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md',
                  selected ? 'border-primary ring-2 ring-primary/20' : 'border-border',
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selected}
                  onChange={() => toggleAsset(asset.publicId)}
                  aria-label={`Chọn ảnh ${asset.publicId}`}
                />
                <div className="relative aspect-square overflow-hidden bg-muted/40">
                  <Image src={asset.thumbnailUrl} alt="" fill sizes="(max-width: 640px) 50vw, 220px" className="object-cover transition-transform group-hover:scale-[1.02]" />
                  <span className={cn(
                    'absolute right-2 top-2 grid size-6 place-items-center rounded-md border text-white',
                    selected ? 'border-primary bg-primary' : 'border-white/80 bg-black/30',
                  )}>
                    {selected ? <Check className="size-4" aria-hidden="true" /> : null}
                  </span>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-foreground" title={asset.publicId}>{asset.publicId.split('/').pop()}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ''}{asset.format.toUpperCase()} · {formatBytes(asset.bytes)}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {hasNextPage ? (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => void setSize(size + 1)} disabled={isValidating}>
            {isValidating ? <Loader2 className="size-4 animate-spin" /> : null} Tải thêm
          </Button>
        </div>
      ) : null}
    </div>
  );
}
