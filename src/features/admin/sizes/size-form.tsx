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

export function SizeForm({ open, onOpenChange, size, onSaved }: SizeFormProps) {
  const { toast } = useToast();
  const { data: categoryOptions = [] } = useSWR('admin-category-options', getCategoryOptions);

  const [name, setName] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(size?.name ?? '');
    setCategoryIds(size?.categories.map((category) => category.id) ?? []);
  }, [open, size]);

  const onSubmit = async () => {
    const finalName = name.trim();
    if (!finalName) {
      setError('Nhập nhãn quy cách.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: finalName, categoryIds };
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
      description="Quy cách là nhãn tự nhập, hiển thị nguyên văn ở biến thể sản phẩm."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Huỷ</Button>
          <Button onClick={onSubmit} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field id="name" label="Nhãn quy cách" error={error ?? undefined}>
          <Input
            id="name"
            value={name}
            placeholder="vd: Cây 65gr, Hộp 250ml, 24 cây / thùng"
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field id="categories" label="Phạm vi danh mục" required={false} hint="Có thể chọn nhiều; bỏ trống = dùng chung toàn hệ thống.">
          <MultiSelect options={categoryOptions} value={categoryIds} onChange={setCategoryIds} />
        </Field>
      </div>
    </Dialog>
  );
}
