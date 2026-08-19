'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Package, Search, X } from 'lucide-react';
import { Dialog } from '@/components/admin/ui/dialog';
import { Input } from '@/components/admin/ui/input';
import { Button } from '@/components/admin/ui/button';
import { Badge } from '@/components/admin/ui/badge';
import { useToast } from '@/components/admin/ui/toast';
import { getProducts } from '@/features/product/api';
import { resolveLocalized } from '@/types/localized';
import { cn } from '@/lib/utils';
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

interface CandidateProduct extends CollectionProduct {
  stock: number;
  status: string;
}

/** Chọn sản phẩm theo lô trước khi lưu để người quản trị luôn biết rõ số lượng thay đổi. */
export function CollectionProductsDialog({ open, onOpenChange, collection }: Props) {
  const { toast } = useToast();
  const [current, setCurrent] = useState<CollectionProduct[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<CandidateProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectedCount = selectedIds.length;
  const currentIds = useMemo(() => new Set(current.map((product) => product.id)), [current]);

  const refreshCurrent = async (): Promise<CollectionProduct[]> => {
    if (!collection) return [];
    setLoadingCurrent(true);
    try {
      const products = await getCollectionProducts(collection.id);
      setCurrent(products);
      return products;
    } catch {
      setCurrent([]);
      return [];
    } finally {
      setLoadingCurrent(false);
    }
  };

  const loadCandidates = async (query: string, existingProducts = current) => {
    setSearching(true);
    try {
      const res = await getProducts({
        search: query.trim() || undefined,
        limit: 24,
        locale: 'vi',
      });
      const existingIds = new Set(existingProducts.map((product) => product.id));
      setResults(
        res.data
          .filter((product) => !existingIds.has(product.id))
          .map((product) => ({
            id: product.id,
            name: resolveLocalized(product.name, 'vi'),
            slug: resolveLocalized(product.slug, 'vi'),
            image: product.images[0] ?? null,
            stock: Number(product.stock_quantity),
            status: product.status,
          })),
      );
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!open || !collection) return;

    setSearch('');
    setResults([]);
    setSelectedIds([]);
    void (async () => {
      const existingProducts = await refreshCurrent();
      await loadCandidates('', existingProducts);
    })();
    // `collection` changes only when the dialog is opened for another collection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, collection]);

  const toggleSelected = (productId: string) => {
    setSelectedIds((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId],
    );
  };

  const searchProducts = () => {
    setSelectedIds([]);
    void loadCandidates(search);
  };

  const addSelected = async () => {
    if (!collection || selectedIds.length === 0) return;
    setBusy(true);
    try {
      await assignProducts(collection.id, selectedIds);
      toast({ title: `Đã thêm ${selectedIds.length} sản phẩm vào bộ sưu tập`, tone: 'success' });
      setSelectedIds([]);
      const existingProducts = await refreshCurrent();
      await loadCandidates(search, existingProducts);
    } catch {
      toast({ title: 'Không thể thêm sản phẩm. Vui lòng thử lại.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (productId: string) => {
    if (!collection) return;
    setBusy(true);
    try {
      await removeProducts(collection.id, [productId]);
      toast({ title: 'Đã gỡ sản phẩm khỏi bộ sưu tập', tone: 'success' });
      const existingProducts = await refreshCurrent();
      await loadCandidates(search, existingProducts);
    } catch {
      toast({ title: 'Không thể gỡ sản phẩm. Vui lòng thử lại.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={collection ? `Sản phẩm — ${collection.name}` : 'Sản phẩm'}
      description="Chọn sản phẩm rồi thêm một lần để dễ kiểm tra thay đổi."
      className="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Đóng
          </Button>
          <Button onClick={addSelected} disabled={busy || selectedCount === 0}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Thêm {selectedCount} sản phẩm
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Danh sách chờ thêm</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Chọn các sản phẩm bên dưới, sau đó xác nhận ở cuối hộp thoại.</p>
          </div>
          <Badge tone={selectedCount > 0 ? 'info' : 'neutral'}>{selectedCount} sản phẩm đã chọn</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Đã thuộc bộ sưu tập</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Các sản phẩm đang được hiển thị trong bộ này.</p>
              </div>
              <Badge tone="success">{current.length}</Badge>
            </div>

            <div className="max-h-[320px] overflow-y-auto rounded-lg border border-border bg-muted/20 p-2">
              {loadingCurrent ? (
                <LoadingState label="Đang tải sản phẩm…" />
              ) : current.length === 0 ? (
                <EmptyState icon={<Package className="size-5 text-primary/70" />} label="Chưa có sản phẩm nào trong bộ sưu tập này." />
              ) : (
                <ul className="flex flex-col gap-1">
                  {current.map((product) => (
                    <li key={product.id} className="flex min-w-0 items-center gap-3 rounded-md bg-white px-2 py-2 shadow-sm">
                      <ProductImage image={product.image} name={product.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        {product.slug ? <p className="truncate text-xs text-muted-foreground">/{product.slug}</p> : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(product.id)}
                        disabled={busy}
                        aria-label={`Gỡ ${product.name} khỏi bộ sưu tập`}
                        className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="min-w-0">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-foreground">Thêm sản phẩm</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Hiển thị tối đa 24 sản phẩm; dùng tìm kiếm để thu hẹp kết quả.</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm theo tên hoặc slug…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && searchProducts()}
                disabled={busy}
              />
              <Button type="button" variant="outline" onClick={searchProducts} disabled={busy || searching} aria-label="Tìm sản phẩm">
                {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                <span className="hidden sm:inline">Tìm</span>
              </Button>
            </div>

            <div className="mt-3 max-h-[260px] overflow-y-auto rounded-lg border border-border bg-white p-2">
              {searching ? (
                <LoadingState label="Đang tìm sản phẩm…" />
              ) : results.length === 0 ? (
                <EmptyState icon={<Search className="size-5 text-primary/70" />} label="Không có sản phẩm chưa thuộc bộ sưu tập phù hợp." />
              ) : (
                <ul className="flex flex-col gap-1">
                  {results.map((product) => {
                    const selected = selectedIds.includes(product.id);
                    return (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => toggleSelected(product.id)}
                          disabled={busy || currentIds.has(product.id)}
                          aria-pressed={selected}
                          className={cn(
                            'flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                            selected ? 'bg-primary/10' : 'hover:bg-muted',
                          )}
                        >
                          <span className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-white',
                          )}>
                            {selected ? <Check className="size-3.5" /> : null}
                          </span>
                          <ProductImage image={product.image} name={product.name} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">{product.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">/{product.slug}</span>
                          </span>
                          <span className="shrink-0 text-right text-xs text-muted-foreground">
                            {product.status === 'active' ? `${product.stock} tồn` : 'Không đăng bán'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </Dialog>
  );
}

function ProductImage({ image, name }: Pick<CollectionProduct, 'image' | 'name'>) {
  return (
    <span className="flex size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted/50">
      {image ? <img src={image} alt="" className="size-full object-cover" /> : <Package className="m-auto size-4 text-muted-foreground" aria-label={`Chưa có ảnh cho ${name}`} />}
    </span>
  );
}

function LoadingState({ label }: { label: string }) {
  return <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {label}</div>;
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex min-h-28 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">{icon}{label}</div>;
}
