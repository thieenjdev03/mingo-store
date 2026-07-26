'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/admin/ui/page-header';
import { ADMIN_NAV } from '@/components/admin/admin-nav';

/** Trang chủ admin — lối tắt tới các module. */
export default function AdminDashboardPage() {
  const modules = ADMIN_NAV.flatMap((group) => group.items).filter((item) => item.href !== '/admin');

  return (
    <div>
      <PageHeader title="Bảng điều khiển" description="Quản trị nội dung & vận hành cửa hàng Mingo." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {modules.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5 transition-colors hover:border-primary hover:bg-muted/30"
            >
              <Icon className="size-6 text-primary" />
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
