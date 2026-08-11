'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { MultiSelect } from '@/components/admin/ui/multi-select';
import { Button } from '@/components/admin/ui/button';
import { useToast } from '@/components/admin/ui/toast';
import { getCategoryOptions } from '@/features/admin/shared/options';
import { createSize, updateSize } from './api';
import { VOLUME_UNITS, type AdminSizeView } from './types';

interface SizeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size: AdminSizeView | null;
  onSaved: () => void;
}

const UNIT_SUGGESTIONS = ['cây', 'hộp', 'lít', 'ổ quế', 'ly', 'thùng'];

/** Tự dựng nhãn từ metadata (khi người dùng chưa tự nhập name). Đơn vị khối lượng lấy động. */
function buildName(unit: string, packQty: string, volumeMl: string, volumeUnit: string): string {
  const u = unit.trim();
  if (volumeMl.trim()) {
    const label = u ? u.charAt(0).toUpperCase() + u.slice(1) : 'Hộp';
    return `${label} ${volumeMl.trim()}${volumeUnit || 'ml'}`;
  }
  if (packQty.trim()) return `${packQty.trim()} ${u} / thùng`.replace(/\s+/g, ' ').trim();
  return '';
}

export function SizeForm({ open, onOpenChange, size, onSaved }: SizeFormProps) {
  const { toast } = useToast();
  const { data: categoryOptions = [] } = useSWR('admin-category-options', getCategoryOptions);

  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [unit, setUnit] = useState('');
  const [packQty, setPackQty] = useState('');
  const [volumeMl, setVolumeMl] = useState('');
  // Đơn vị khối lượng/dung tích. Bản ghi CŨ (đang sửa) mặc định 'ml'; tạo MỚI để trống ép chọn.
  const [volumeUnit, setVolumeUnit] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNameTouched(false);
    setName(size?.name ?? '');
    setUnit(size?.unit ?? '');
    setPackQty(size?.packQty != null ? String(size.packQty) : '');
    setVolumeMl(size?.volumeMl != null ? String(size.volumeMl) : '');
    setVolumeUnit(size ? size.volumeUnit ?? 'ml' : '');
    setCategoryIds(size?.categories.map((category) => category.id) ?? []);
  }, [open, size]);

  // Gợi ý name tự động khi chưa sửa tay.
  const autoName = buildName(unit, packQty, volumeMl, volumeUnit);
  const effectiveName = nameTouched || name ? name : autoName;

  const onSubmit = async () => {
    const finalName = (name.trim() || autoName).trim();
    if (!finalName) {
      setError('Nhập nhãn hiển thị (hoặc điền đơn vị + SL/thùng / dung tích để tự tạo).');
      return;
    }
    // P0: đã nhập giá trị khối lượng thì bắt buộc chọn đơn vị trước khi lưu.
    if (volumeMl.trim() && !volumeUnit) {
      setError('Vui lòng chọn đơn vị cho khối lượng / dung tích.');
      return;
    }
    // P1: đơn vị chỉ có ý nghĩa khi giá trị > 0.
    if (volumeMl.trim() && Number(volumeMl) <= 0) {
      setError('Khối lượng / dung tích phải lớn hơn 0.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: finalName,
        unit: unit.trim() || undefined,
        packQty: packQty.trim() ? Number(packQty) : undefined,
        volumeMl: volumeMl.trim() ? Number(volumeMl) : undefined,
        volumeUnit: volumeMl.trim() ? volumeUnit : undefined,
        categoryIds,
      };
      if (size) {
        await updateSize(size.id, payload);
        toast({ title: 'Đã cập nhật quy cách', tone: 'success' });
      } else {
        await createSize(payload);
        toast({ title: 'Đã tạo quy cách', tone: 'success' });
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
      title={size ? 'Sửa quy cách' : 'Thêm quy cách'}
      description="Nhãn hiển thị (name) là chính; đơn vị / SL·thùng / dung tích là metadata tuỳ chọn."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Huỷ</Button>
          <Button onClick={onSubmit} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field id="name" label="Nhãn hiển thị" hint="Bỏ trống để tự tạo từ metadata bên dưới." error={error ?? undefined}>
          <Input
            id="name"
            value={effectiveName}
            placeholder="vd: 24 cây / thùng, Hộp 250ml"
            onChange={(e) => { setNameTouched(true); setName(e.target.value); }}
          />
        </Field>
        <fieldset className="rounded-lg border border-border bg-muted/40 p-4">
          <legend className="px-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Thông số đóng gói (tuỳ chọn)
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="unit" label="Đơn vị" required={false}>
              <Input id="unit" list="unit-suggestions" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="cây / hộp / lít" />
              <datalist id="unit-suggestions">
                {UNIT_SUGGESTIONS.map((u) => <option key={u} value={u} />)}
              </datalist>
            </Field>
            <Field id="packQty" label="SL / thùng" required={false}>
              <Input id="packQty" type="number" min={0} value={packQty} onChange={(e) => setPackQty(e.target.value)} placeholder="24" />
            </Field>
            <Field id="volumeMl" label="Khối lượng / Dung tích" required={false} className="sm:col-span-2">
              <div className="flex gap-2">
                <Input id="volumeMl" type="number" min={0} value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} placeholder="250" className="flex-1" />
                <NativeSelect fitContent aria-label="Đơn vị khối lượng / dung tích" value={volumeUnit} onChange={(e) => setVolumeUnit(e.target.value)}>
                  <option value="">— đơn vị —</option>
                  {VOLUME_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </NativeSelect>
              </div>
            </Field>
          </div>
        </fieldset>
        <Field id="categories" label="Phạm vi danh mục" required={false} hint="Có thể chọn nhiều; bỏ trống = dùng chung toàn hệ thống.">
          <MultiSelect options={categoryOptions} value={categoryIds} onChange={setCategoryIds} />
        </Field>
      </div>
    </Dialog>
  );
}
