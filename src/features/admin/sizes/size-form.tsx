'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { MultiSelect } from '@/components/admin/ui/multi-select';
import { Button } from '@/components/admin/ui/button';
import { useToast } from '@/components/admin/ui/toast';
import { getCategoryOptions } from '@/features/admin/shared/options';
import { createSize, updateSize } from './api';
import type { AdminSizeView } from './types';

interface SizeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size: AdminSizeView | null;
  onSaved: () => void;
}

const UNIT_SUGGESTIONS = ['cây', 'hộp', 'lít', 'ổ quế', 'ly', 'thùng'];

/** Tự dựng nhãn từ metadata (khi người dùng chưa tự nhập name). */
function buildName(unit: string, packQty: string, volumeMl: string): string {
  const u = unit.trim();
  if (volumeMl.trim()) {
    const label = u ? u.charAt(0).toUpperCase() + u.slice(1) : 'Hộp';
    return `${label} ${volumeMl.trim()}ml`;
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
    setCategoryIds(size?.categories.map((category) => category.id) ?? []);
  }, [open, size]);

  // Gợi ý name tự động khi chưa sửa tay.
  const autoName = buildName(unit, packQty, volumeMl);
  const effectiveName = nameTouched || name ? name : autoName;

  const onSubmit = async () => {
    const finalName = (name.trim() || autoName).trim();
    if (!finalName) {
      setError('Nhập nhãn hiển thị (hoặc điền đơn vị + SL/thùng / dung tích để tự tạo).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: finalName,
        unit: unit.trim() || undefined,
        packQty: packQty.trim() ? Number(packQty) : undefined,
        volumeMl: volumeMl.trim() ? Number(volumeMl) : undefined,
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
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="unit" label="Đơn vị" required={false}>
            <Input id="unit" list="unit-suggestions" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="cây / hộp / lít" />
            <datalist id="unit-suggestions">
              {UNIT_SUGGESTIONS.map((u) => <option key={u} value={u} />)}
            </datalist>
          </Field>
          <Field id="packQty" label="SL / thùng" required={false}>
            <Input id="packQty" type="number" min={0} value={packQty} onChange={(e) => setPackQty(e.target.value)} placeholder="24" />
          </Field>
          <Field id="volumeMl" label="Dung tích (ml)" required={false}>
            <Input id="volumeMl" type="number" min={0} value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} placeholder="250" />
          </Field>
        </div>
        <Field id="categories" label="Phạm vi danh mục" required={false} hint="Có thể chọn nhiều; bỏ trống = dùng chung toàn hệ thống.">
          <MultiSelect options={categoryOptions} value={categoryIds} onChange={setCategoryIds} />
        </Field>
      </div>
    </Dialog>
  );
}
