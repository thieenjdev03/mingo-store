'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_NAV } from './admin-nav';
import { clearAdminSession, getAdminUser } from '@/lib/admin/auth';

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Khung admin: sidebar điều hướng + header, non-localized (dùng next/link, không qua i18n). */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getAdminUser();

  const handleLogout = () => {
    clearAdminSession();
    router.replace('/admin/login');
  };

  const nav = (
    <nav className="flex flex-col gap-6 p-4">
      {ADMIN_NAV.map((group) => (
        <div key={group.heading}>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{group.heading}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <Icon className="size-[18px]" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-xl font-black text-primary">Mingo</span>
          <span className="ml-2 text-sm font-semibold text-muted-foreground">Admin</span>
        </div>
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">{nav}</div>
      </aside>

      {/* Sidebar mobile (drawer) */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 overflow-y-auto bg-white">
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <span className="text-xl font-black text-primary">Mingo</span>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-6" />
          </button>
          <div className="ml-auto flex items-center gap-4">
            {user ? <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span> : null}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="size-4" /> Đăng xuất
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
