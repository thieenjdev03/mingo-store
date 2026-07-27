'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/admin/auth';

/**
 * Guard client-side cho `/admin/**`: chưa đăng nhập admin -> đẩy sang /admin/login.
 * Backend vẫn là nguồn chân lý (401/403), guard này chỉ để UX. Kiểm tra sau mount vì
 * token nằm ở localStorage (không đọc được khi SSR).
 *
 * Redirect dùng window.location (điều hướng cứng) để chắc chắn thoát khỏi màn "đang kiểm tra"
 * kể cả khi soft-navigation không kích hoạt; kèm link dự phòng nếu vì lý do nào đó chưa chuyển.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'ok' | 'unauth'>('checking');

  useEffect(() => {
    if (isAdminAuthenticated()) {
      setStatus('ok');
      return;
    }
    setStatus('unauth');
    window.location.replace('/admin/login');
  }, []);

  if (status === 'ok') return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-muted/30 px-4 text-center text-sm text-muted-foreground">
      {status === 'checking' ? (
        <span>Đang kiểm tra phiên đăng nhập…</span>
      ) : (
        <>
          <span>Bạn cần đăng nhập quản trị để tiếp tục.</span>
          <Link href="/admin/login" className="font-semibold text-primary underline underline-offset-4">
            Tới trang đăng nhập
          </Link>
        </>
      )}
    </div>
  );
}
