'use client';

import { useEffect, useState } from 'react';
import { CreditCard, LayoutGrid, LogOut, Mail, Receipt, ShoppingBag, Star, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { meControllerGetMe } from '@/lib/api/generated/me/me';
import { ordersControllerGetMyOrders } from '@/lib/api/generated/orders/orders';
import { getAccessToken, clearAccessToken } from '@/lib/auth/token';
import { CustomerAuthForm } from './customer-auth-form';
import { OrderHistory, type MyOrder } from './order-history';
import { toAccountView, type AccountView } from './types';

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-background px-4 py-6 text-center text-sm text-muted-foreground">{message}</div>
  );
}

export function AccountPageView() {
  const t = useTranslations('account');
  const router = useRouter();
  // null = chưa biết (đang đọc localStorage sau mount), '' = không có token.
  const [token, setToken] = useState<string | null | ''>(null);
  const [account, setAccount] = useState<AccountView | null>(null);
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setToken(getAccessToken() ?? '');
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    meControllerGetMe()
      .then((user) => {
        if (cancelled) return;
        setAccount(toAccountView(user));
      })
      .catch(() => {
        if (cancelled) return;
        // Token hết hạn/không hợp lệ — quay về trạng thái chưa đăng nhập.
        clearAccessToken();
        setToken('');
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Đơn hàng tải độc lập — lỗi ở đây không chặn hiển thị hồ sơ, chỉ hiện empty state.
    ordersControllerGetMyOrders()
      .then((res) => {
        if (cancelled) return;
        setOrders(Array.isArray(res) ? (res as MyOrder[]) : []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleLogout() {
    clearAccessToken();
    setToken('');
    setAccount(null);
    router.push('/login');
  }

  if (token === null || loading) {
    return <div className="bg-cream py-20 text-center text-muted-foreground">{t('title')}…</div>;
  }

  if (!token || !account) {
    // Chưa đăng nhập -> hiển thị thẳng form đăng nhập ngay tại trang tài khoản.
    // Đăng nhập xong, đọc lại token để trang tự chuyển sang giao diện tài khoản (không điều hướng).
    return (
      <>
        {error ? (
          <div className="bg-cream pt-8 text-center text-sm font-semibold text-primary sm:pt-10">
            {t('sessionExpired')}
          </div>
        ) : null}
        <CustomerAuthForm mode="login" onAuthenticated={() => setToken(getAccessToken() ?? '')} />
      </>
    );
  }

  const accountDetails = [
    { label: t('email'), value: account.email },
    { label: t('phone'), value: account.phoneNumber || t('notProvided') },
    { label: t('birthDate'), value: t('notProvided') },
    { label: t('address'), value: account.addressSummary ?? t('notProvided') },
  ];

  const navItems: Array<{ key: string; label: string; icon: LucideIcon; href: string | null; current: boolean }> = [
    { key: 'overview', label: t('nav.overview'), icon: LayoutGrid, href: null, current: true },
  ];

  return (
    <div className="bg-cream py-8 sm:py-10 lg:py-14">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-8 px-5 sm:px-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="shrink-0 lg:w-[260px]">
          <p className="text-2xl font-bold text-foreground">{t('welcome')}</p>
          <p className="mt-1 font-semibold text-foreground">{account.fullName}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('memberTier')}</p>

          <nav className="mt-8 flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <span
                  className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${
                    item.current
                      ? 'border-l-2 border-primary text-primary lg:rounded-l-none'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </span>
              );
              if (!item.href) return <span key={item.key}>{content}</span>;
              if (item.href.startsWith('#')) {
                return (
                  <a key={item.key} href={item.href}>
                    {content}
                  </a>
                );
              }
              return (
                <Link key={item.key} href={item.href}>
                  {content}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t('logout')}
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 space-y-6">
          {/* Identity header */}
          <section className="flex flex-col gap-5 rounded-xl bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
              <ShoppingBag className="size-8" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{account.fullName}</h1>
              <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" aria-hidden="true" />
                {account.email}
              </p>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Account details — dữ liệu thật từ /me */}
            <section id="account-details" className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">{t('accountDetails')}</h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('accountDetailsSubtitle')}</p>
                </div>
                <button type="button" className="text-sm font-bold text-primary hover:text-primary-dark">
                  {t('edit')}
                </button>
              </div>
              <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {accountDetails.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                    <dd className="mt-1.5 font-semibold text-foreground">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Points / rewards — chưa có backend điểm thưởng nên hiển thị empty state. */}
            <section className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2">
                <Star className="size-5 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-bold">{t('availablePoints')}</h2>
              </div>
              <div className="mt-4">
                <EmptyState message={t('noData')} />
              </div>
            </section>
          </div>

          {/* Lịch sử đơn hàng — dữ liệu thật từ /orders/my-orders */}
          <OrderHistory orders={orders} />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Wallet — chưa có backend phương thức thanh toán lưu sẵn. */}
            <section id="wallet" className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-bold">{t('myWallet')}</h2>
              </div>
              <div className="mt-4">
                <EmptyState message={t('noData')} />
              </div>
            </section>

            {/* Vouchers — chưa có backend voucher. */}
            <section className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2">
                <Receipt className="size-5 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-bold">{t('voucherWallet')}</h2>
              </div>
              <div className="mt-4">
                <EmptyState message={t('noData')} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
