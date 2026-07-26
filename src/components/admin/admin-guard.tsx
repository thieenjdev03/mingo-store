'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';

/**
 * Guard client-side cho `/admin/**`: chưa đăng nhập admin -> đẩy sang /admin/login.
 * Backend vẫn là nguồn chân lý (401/403), guard này chỉ để UX. Kiểm tra sau mount vì
 * token nằm ở localStorage (không đọc được khi SSR).
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'ok'>('checking');

  useEffect(() => {
    if (isAdminAuthenticated()) {
      setStatus('ok');
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Đang kiểm tra phiên đăng nhập…
      </div>
    );
  }

  return <>{children}</>;
}
