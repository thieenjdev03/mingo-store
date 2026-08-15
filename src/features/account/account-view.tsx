'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Coins, Gift, LayoutGrid, LogOut, Mail, Package, ShoppingBag, Sparkles, type LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { meControllerGetMe } from '@/lib/api/generated/me/me';
import { getMyOrders } from '@/features/checkout/api';
import { updateMyProfile, type UpdateMyProfilePayload } from './api';
import { getAccessToken, clearAccessToken } from '@/lib/auth/token';
import { CustomerAuthForm } from './customer-auth-form';
import { OrderHistory, type MyOrder } from './order-history';
import { toAccountView, type AccountView } from './types';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';
import { fCurrencyVND } from '@/lib/format';

const NON_REWARD_ORDER_STATUSES = new Set(['CANCELLED', 'FAILED', 'REFUNDED']);
const VND_PER_POINT = 10;

export function AccountPageView() {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  // null = chưa biết (đang đọc localStorage sau mount), '' = không có token.
  const [token, setToken] = useState<string | null | ''>(null);
  const [account, setAccount] = useState<AccountView | null>(null);
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileDraft, setProfileDraft] = useState<UpdateMyProfilePayload>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
  });

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
    getMyOrders()
      .then((res) => {
        if (cancelled) return;
        setOrders(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!account) return;
    setProfileDraft({
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      phoneNumber: account.phoneNumber,
      country: account.country,
    });
  }, [account]);

  function handleLogout() {
    clearAccessToken();
    setToken('');
    setAccount(null);
    setEditingProfile(false);
    router.push('/login');
  }

  function startEditingProfile() {
    if (!account) return;
    setProfileDraft({
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      phoneNumber: account.phoneNumber,
      country: account.country,
    });
    setProfileError(false);
    setProfileSaved(false);
    setEditingProfile(true);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError(false);
    setProfileSaved(false);
    try {
      const updated = await updateMyProfile({
        email: profileDraft.email.trim(),
        firstName: profileDraft.firstName.trim(),
        lastName: profileDraft.lastName.trim(),
        phoneNumber: profileDraft.phoneNumber.trim(),
        country: profileDraft.country.trim(),
      });
      setAccount(toAccountView(updated));
      setEditingProfile(false);
      setProfileSaved(true);
    } catch {
      setProfileError(true);
    } finally {
      setSavingProfile(false);
    }
  }

  if (token === null || loading) {
    return <div className="bg-cream py-20"><MeltingIceCreamLoader label={`${t('title')}…`} /></div>;
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
    { label: t('country'), value: account.country || t('notProvided') },
    { label: t('address'), value: account.addressSummary ?? t('notProvided') },
  ];

  const rewardOrders = (orders ?? []).filter(
    (order) => order.paymentStatus === 'PAID' && !NON_REWARD_ORDER_STATUSES.has(order.status),
  );
  const eligibleSpend = rewardOrders.reduce((total, order) => {
    const orderTotal = Number(order.summary.total);
    return Number.isFinite(orderTotal) ? total + orderTotal : total;
  }, 0);
  const availablePoints = Math.floor(eligibleSpend / VND_PER_POINT);

  const navItems: Array<{ key: string; label: string; icon: LucideIcon; href: string | null; current: boolean }> = [
    { key: 'overview', label: t('nav.overview'), icon: LayoutGrid, href: null, current: true },
    { key: 'rewards', label: t('nav.rewards'), icon: Gift, href: '#loyalty-points', current: false },
    { key: 'orders', label: t('nav.orders'), icon: Package, href: '/orders', current: false },
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

          <section
            id="loyalty-points"
            aria-labelledby="loyalty-points-title"
            className="relative scroll-mt-28 overflow-hidden rounded-[28px] bg-primary px-6 py-7 text-primary-foreground shadow-[0_18px_50px_rgba(254,80,0,0.2)] sm:px-8 sm:py-9"
          >
            <span className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border-[44px] border-white/10" aria-hidden="true" />
            <span className="pointer-events-none absolute -bottom-16 right-32 size-32 rounded-full bg-white/8" aria-hidden="true" />

            <div className="relative grid gap-7 sm:grid-cols-[minmax(0,1fr)_minmax(250px,0.72fr)] sm:items-end">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                  <Sparkles className="size-4" aria-hidden="true" />
                  <h2 id="loyalty-points-title">{t('rewardsTitle')}</h2>
                </div>
                <p className="mt-5 text-sm font-semibold text-white/75">{t('availablePoints')}</p>
                {orders === null ? (
                  <div className="mt-2 h-14 w-40 animate-pulse rounded-xl bg-white/15" aria-label={t('rewardsLoading')} />
                ) : (
                  <p className="mt-1 font-display text-5xl font-extrabold leading-none sm:text-6xl">
                    {availablePoints.toLocaleString(locale)}
                    <span className="ml-2 text-lg font-bold text-white/75">{t('pointsUnit')}</span>
                  </p>
                )}
                <p className="mt-4 max-w-md text-sm leading-6 text-white/75">{t('pointsRule')}</p>
              </div>

              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <dt className="flex items-center gap-2 text-xs font-semibold text-white/70">
                    <Coins className="size-4" aria-hidden="true" />
                    {t('eligibleSpend')}
                  </dt>
                  <dd className="mt-3 text-lg font-bold text-white">{fCurrencyVND(eligibleSpend)}</dd>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <dt className="flex items-center gap-2 text-xs font-semibold text-white/70">
                    <Package className="size-4" aria-hidden="true" />
                    {t('eligibleOrders')}
                  </dt>
                  <dd className="mt-3 text-lg font-bold text-white">{rewardOrders.length}</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Account details — dữ liệu thật từ /me */}
          <section id="account-details" className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">{t('accountDetails')}</h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('accountDetailsSubtitle')}</p>
                </div>
                {!editingProfile ? (
                  <button type="button" onClick={startEditingProfile} className="text-sm font-bold text-primary hover:text-primary-dark">
                    {t('edit')}
                  </button>
                ) : null}
              </div>
              {editingProfile ? (
                <form className="mt-5 space-y-5" onSubmit={handleProfileSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t('firstName')}
                      <input
                        value={profileDraft.firstName}
                        onChange={(event) => setProfileDraft((current) => ({ ...current, firstName: event.target.value }))}
                        className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t('lastName')}
                      <input
                        value={profileDraft.lastName}
                        onChange={(event) => setProfileDraft((current) => ({ ...current, lastName: event.target.value }))}
                        className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  </div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {t('email')}
                    <input
                      type="email"
                      required
                      value={profileDraft.email}
                      onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t('phone')}
                      <input
                        value={profileDraft.phoneNumber}
                        onChange={(event) => setProfileDraft((current) => ({ ...current, phoneNumber: event.target.value }))}
                        className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t('country')}
                      <input
                        value={profileDraft.country}
                        onChange={(event) => setProfileDraft((current) => ({ ...current, country: event.target.value }))}
                        className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  </div>
                  {profileError ? <p className="text-sm font-semibold text-destructive">{t('updateError')}</p> : null}
                  <div className="flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={() => setEditingProfile(false)} disabled={savingProfile} className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-background disabled:opacity-50">
                      {t('cancel')}
                    </button>
                    <button type="submit" disabled={savingProfile} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary-dark disabled:opacity-50">
                      {savingProfile ? '…' : t('save')}
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  {accountDetails.map((item) => (
                    <div key={item.label}>
                      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                      <dd className="mt-1.5 font-semibold text-foreground">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {profileSaved && !editingProfile ? <p className="mt-4 text-sm font-semibold text-emerald-700">{t('updateSuccess')}</p> : null}
          </section>

          {/* Lịch sử đơn hàng — dữ liệu thật từ /orders/my-orders */}
          <OrderHistory orders={orders} />
        </main>
      </div>
    </div>
  );
}
