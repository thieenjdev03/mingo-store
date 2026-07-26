import type { ReactNode } from 'react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminShell } from '@/components/admin/admin-shell';

/** Mọi trang trong nhóm này được bảo vệ bởi guard admin + bọc trong shell (sidebar/header). */
export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
