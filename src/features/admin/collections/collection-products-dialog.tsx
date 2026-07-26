'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog } from '@/components/admin/ui/dialog';
import { Input } from '@/components/admin/ui/input';
import { Button } from '@/components/admin/ui/button';
import { useToast } from '@/components/admin/ui/toast';
import { getProducts } from '@/features/product/api';
import { resolveLocalized } from '@/types/localized';
import {
  getCollectionProducts,
  assignProducts,
  removeProducts,
  type CollectionItem,
  type CollectionProduct,
} from './api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: CollectionItem | null;
}

export function CollectionProductsDialog({ open, onOpenChange, collection }: Props) {
  const { toast } = useToast();
  const [current, setCurrent] = useState<CollectionProduct[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<CollectionProduct[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!collection) return;
    try {
      setCurrent(await getCollectionProducts(collection.id));
    } catch {
      setCurrent([]);
    }
  };

  useEffect(() => {
    if (open && collection) {
      setSearch('');
      setResults([]);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, collection]);

  const doSearch = async () => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    try {
      const res = await getProducts({ search: search.trim(), limit: 20, locale: 'vi' });
      const currentIds = new Set(current.map((p) => p.id));
      setResults(
        res.data
          .filter((p) => !currentIds.has(p.id))
          .map((p) => ({ id: p.id, name: resolveLocalized(p.name, 'vi'), image: p.images?.[0] ?? null })),
      );
    } catch {
      setResults([]);
    }
  };

  const add = async (pid: string) => {
    if (!collection) return;
    setBusy(true);
    try {
      await assignProducts(collection.id, [pid]);
      toast({ title: 'Đã thêm sản phẩm', tone: 'success' });
      setResults((prev) => prev.filter((p) => p.id !== pid));
      await refresh();
    } catch {
      toast({ title: 'Thêm thất bại', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (pid: string) => {
    if (!collection) return;
    setBusy(true);
    try {
      await removeProducts(collection.id, [pid]);
      toast({ title: 'Đã gỡ sản phẩm', tone: 'success' });
      await refresh();
    } catch {
      toast({ title: 'Gỡ thất bại', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={collection ? `Sản phẩm — ${collection.name}` : 'Sản phẩm'}
      className="max-w-xl"
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Đang thuộc bộ sưu tập ({current.length})</p>
          {current.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có sản phẩm nào.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {current.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>{p.name}</span>
                  <button onClick={() => remove(p.id)} disabled={busy} className="text-destructive hover:opacity-70" aria-label="Gỡ">
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Thêm sản phẩm</p>
          <div className="flex gap-2">
            <Input
              placeholder="Tìm sản phẩm theo tên…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            />
            <Button variant="outline" onClick={doSearch}>
              Tìm
            </Button>
          </div>
          {results.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {results.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>{p.name}</span>
                  <button onClick={() => add(p.id)} disabled={busy} className="text-primary hover:opacity-70" aria-label="Thêm">
                    <Plus className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
}
