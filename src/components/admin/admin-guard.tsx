'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { clearAdminSession } from '@/lib/admin/auth';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';

/**
 * Guard phía client chỉ xử lý phiên hết hạn khi người dùng đang mở trang.
 * Quyền truy cập thật đã được kiểm tra ở middleware bằng cookie HttpOnly + backend.
 *
 * Redirect dùng window.location (điều hướng cứng) để chắc chắn thoát khỏi màn "đang kiểm tra"
 * kể cả khi soft-navigation không kích hoạt; kèm link dự phòng nếu vì lý do nào đó chưa chuyển.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'ok' | 'unauth'>('checking');

  useEffect(() => {
    let settled = false;
    const goToLogin = () => {
      if (settled) return;
      settled = true;
      setStatus('unauth');
      window.location.replace('/admin/login');
    };

    // Không để lỗi storage hoặc browser/webview khiến guard treo vô thời hạn.
    const fallbackTimer = window.setTimeout(goToLogin, 3000);

    fetch('/api/admin/session', { cache: 'no-store' })
      .then((response) => {
        if (settled) return;
        if (!response.ok) throw new Error('Admin session is invalid');
        settled = true;
        window.clearTimeout(fallbackTimer);
        setStatus('ok');
      })
      .catch(() => {
        window.clearTimeout(fallbackTimer);
        clearAdminSession();
        goToLogin();
      });

    return () => {
      settled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  if (status === 'ok') return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-muted/30 px-4 text-center text-sm text-muted-foreground">
      {status === 'checking' ? (
        <MeltingIceCreamLoader label="Đang kiểm tra phiên đăng nhập…" />
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
