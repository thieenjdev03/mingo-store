'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@/lib/admin/zod-resolver';
import { authControllerLogin } from '@/lib/api/generated/auth/auth';
import { ApiError } from '@/lib/api/fetcher';
import { saveAdminSession } from '@/lib/admin/auth';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Button } from '@/components/admin/ui/button';

const schema = z.object({
  email: z.string().min(1, 'Nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Nhập mật khẩu'),
});
type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await authControllerLogin(values);
      if (res.user.role !== 'admin') {
        setServerError('Tài khoản này không có quyền quản trị.');
        return;
      }
      saveAdminSession(res.accessToken, { id: res.user.id, email: res.user.email, role: res.user.role });
      router.replace('/admin');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setServerError('Email hoặc mật khẩu không đúng.');
      } else {
        setServerError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-2xl font-black text-primary">Mingo</span>
          <p className="mt-1 text-sm text-muted-foreground">Đăng nhập trang quản trị</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="username" {...register('email')} />
          </Field>
          <Field id="password" label="Mật khẩu" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
          </Field>
          {serverError ? <p className="text-sm font-medium text-destructive">{serverError}</p> : null}
          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  );
}
