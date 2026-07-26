'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/admin/zod-resolver';
import type { PolicyDto } from '@/lib/api/generated/ecomAPI.schemas';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
import { useToast } from '@/components/admin/ui/toast';
import { createPolicy, updatePolicy } from './api';

const schema = z.object({
  title: z.string().min(1, 'Nhập tiêu đề'),
  slug: z.string().optional(),
  content: z.string().min(1, 'Nhập nội dung'),
  display_order: z.coerce.number().int().min(0).optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface PolicyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = tạo mới; có giá trị = chỉnh sửa. */
  policy: PolicyDto | null;
  onSaved: () => void;
}

export function PolicyForm({ open, onOpenChange, policy, onSaved }: PolicyFormProps) {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Điền sẵn khi mở (edit) hoặc reset (create).
  useEffect(() => {
    if (!open) return;
    if (policy) {
      reset({
        title: policy.title,
        slug: policy.slug,
        content: policy.content,
        display_order: policy.display_order,
        is_active: policy.is_active,
      });
      setIsActive(policy.is_active);
    } else {
      reset({ title: '', slug: '', content: '', display_order: 0, is_active: true });
      setIsActive(true);
    }
  }, [open, policy, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        title: values.title,
        slug: values.slug?.trim() || undefined,
        content: values.content,
        display_order: values.display_order,
        is_active: values.is_active,
      };
      if (policy) {
        await updatePolicy(policy.id, payload);
        toast({ title: 'Đã cập nhật chính sách', tone: 'success' });
      } else {
        await createPolicy({ title: payload.title, content: payload.content, slug: payload.slug, display_order: payload.display_order, is_active: payload.is_active });
        toast({ title: 'Đã tạo chính sách', tone: 'success' });
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast({ title: 'Lưu thất bại', description: 'Vui lòng thử lại.', tone: 'error' });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={policy ? 'Sửa chính sách' : 'Thêm chính sách'}
      description="Nội dung là HTML (được backend làm sạch khi lưu)."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button type="submit" form="policy-form" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </>
      }
    >
      <form id="policy-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field id="title" label="Tiêu đề" error={errors.title?.message}>
          <Input id="title" {...register('title')} />
        </Field>
        <Field id="slug" label="Slug" required={false} hint="Bỏ trống để tự sinh từ tiêu đề." error={errors.slug?.message}>
          <Input id="slug" {...register('slug')} placeholder="vd: chinh-sach-bao-mat" />
        </Field>
        <Field id="content" label="Nội dung (HTML)" error={errors.content?.message}>
          <Textarea id="content" rows={10} className="font-mono text-xs" {...register('content')} />
        </Field>
        <Field id="display_order" label="Thứ tự hiển thị" required={false} error={errors.display_order?.message}>
          <Input id="display_order" type="number" min={0} {...register('display_order')} />
        </Field>
        <div className="flex items-center gap-3">
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={(v) => {
              setIsActive(v);
              setValue('is_active', v);
            }}
          />
          <label htmlFor="is_active" className="text-sm font-semibold text-foreground">
            Kích hoạt (hiển thị trên storefront)
          </label>
        </div>
      </form>
    </Dialog>
  );
}
