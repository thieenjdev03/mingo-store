'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Gift, LayoutGrid, LogOut, Mail, Package, Phone, ShoppingBag, type LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { meControllerGetMe } from '@/lib/api/generated/me/me';
import { getMyOrders, getShippingAddresses, upsertShippingAddress } from '@/features/checkout/api';
import { getShippingAreas } from '@/features/checkout/shipping-locations';
import type { SavedShippingAddress } from '@/features/checkout/types';
import { provinces } from '@/lib/vn-address';
import { updateMyProfile, type UpdateMyProfilePayload } from './api';
import { getAccessToken, clearAccessToken } from '@/lib/auth/token';
import { clearAdminSessionCookie } from '@/lib/admin/session-client';
import { CustomerAuthForm } from './customer-auth-form';
import { OrderHistory, type MyOrder } from './order-history';
import { PointsSection } from '@/features/points/points-section';
import { usePointsBalance } from '@/features/points/use-points-balance';
import { FREE_ICE_CREAM_REWARD } from '@/config/free-ice-cream-reward';
import { toAccountView, type AccountView } from './types';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';

const REWARD_START_POINTS = 1_000;

/** Địa chỉ giao hàng mặc định — dùng chung field/enpoint với checkout. */
interface AddressDraft {
  provinceId: string;
  areaId: string;
  streetLine1: string;
}

const EMPTY_ADDRESS_DRAFT: AddressDraft = { provinceId: '', areaId: '', streetLine1: '' };

/** Địa chỉ đã lưu -> draft; khớp id trước, fallback theo tên vì bản ghi cũ có thể chỉ có tên. */
function toAddressDraft(address: SavedShippingAddress | null): AddressDraft {
  if (!address) return EMPTY_ADDRESS_DRAFT;
  const province = provinces.find((item) => item.id === address.provinceId || item.name === address.province) ?? null;
  const area = getShippingAreas(province).find(
    (item) => item.id === address.wardId || item.name === address.district || item.name === address.ward,
  );
  return {
    provinceId: province?.id ?? '',
    areaId: area?.id ?? '',
    streetLine1: address.streetLine1 ?? '',
  };
}

export function AccountPageView() {
  const t = useTranslations('account');
  // Nhãn tỉnh/quận/địa chỉ dùng lại nguyên văn của checkout, không nhân bản chuỗi dịch.
  const tCheckout = useTranslations('checkout');
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
    profile: '',
  });
  const [shippingAddress, setShippingAddress] = useState<SavedShippingAddress | null>(null);
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(EMPTY_ADDRESS_DRAFT);
  const { balance: pointsBalance, isLoading: pointsLoading } = usePointsBalance(!!token);

  const areaOptions = getShippingAreas(provinces.find((item) => item.id === addressDraft.provinceId) ?? null);

  useEffect(() => {
    setToken(getAccessToken() ?? '');
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    meControllerGetMe()
      .then(async (user) => {
        if (cancelled) return;
        setAccount(toAccountView(user));
        // Địa chỉ giao hàng nằm ở endpoint riêng (dùng chung với checkout), lỗi ở đây chỉ để form trống.
        const addresses = await getShippingAddresses(user.id).catch(() => []);
        if (cancelled) return;
        setShippingAddress(addresses.find((item) => item.isShipping && item.isDefault) ?? addresses[0] ?? null);
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
      profile: account.profile,
    });
  }, [account]);

  function handleLogout() {
    clearAccessToken();
    void clearAdminSessionCookie();
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
      profile: account.profile,
    });
    setAddressDraft(toAddressDraft(shippingAddress));
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
        profile: profileDraft.profile.trim(),
      });
      const province = provinces.find((item) => item.id === addressDraft.provinceId);
      const area = getShippingAreas(province ?? null).find((item) => item.id === addressDraft.areaId);
      const street = addressDraft.streetLine1.trim();

      if (province && area && street) {
        const saved = await upsertShippingAddress(updated.id, {
          recipientName: [updated.firstName, updated.lastName].filter(Boolean).join(' ') || updated.email,
          recipientPhone: updated.phoneNumber ?? '',
          label: 'Mặc định',
          countryCode: 'VN',
          province: province.name,
          district: area.name,
          ward: area.name,
          streetLine1: street,
          isShipping: true,
          isDefault: true,
        });
        setShippingAddress({
          ...saved,
          provinceId: province.id,
          wardId: area.id,
          ward: saved.ward ?? null,
          isShipping: true,
          isDefault: true,
        });
        // /me trả kèm addresses -> đọc lại để tóm tắt địa chỉ hiển thị đúng ngay sau khi lưu.
        setAccount(toAccountView(await meControllerGetMe()));
      } else {
        setAccount(toAccountView(updated));
      }
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
        <CustomerAuthForm mode="login" />
      </>
    );
  }

  const accountDetails = [
    { label: t('email'), value: account.email },
    { label: t('phone'), value: account.phoneNumber || t('notProvided') },
    { label: t('country'), value: account.country || t('notProvided') },
    { label: t('profileBio'), value: account.profile || t('notProvided') },
    { label: t('address'), value: account.addressSummary ?? t('notProvided') },
  ];

  // Backend là nguồn dữ liệu duy nhất cho điểm: đã bao gồm quy tắc cộng/trừ và hoàn điểm.
  const availablePoints = pointsBalance?.balance ?? 0;
  const freeIceCreamRewardEnabled = FREE_ICE_CREAM_REWARD.isEnabled;
  const rewardTargetPoints = FREE_ICE_CREAM_REWARD.targetPoints;
  const pointsUntilReward = freeIceCreamRewardEnabled
    ? Math.max(rewardTargetPoints - availablePoints, 0)
    : Number.POSITIVE_INFINITY;
  const rewardProgress = freeIceCreamRewardEnabled
    ? Math.min((availablePoints / rewardTargetPoints) * 100, 100)
    : 0;

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
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {account.email}
              </p>
              <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                {account.phoneNumber || t('notProvided')}
              </p>
            </div>
          </section>

          <section
            id="loyalty-points"
            aria-labelledby="loyalty-points-title"
            className="relative scroll-mt-28 overflow-hidden rounded-[28px] border border-border/70 bg-card px-6 py-8 shadow-[0_16px_45px_rgba(35,31,28,0.09)] sm:px-9 sm:py-10 lg:px-10"
          >
            <span className="pointer-events-none absolute -right-32 -top-40 size-80 rounded-full bg-primary/[0.035]" aria-hidden="true" />

            <div className="relative grid gap-9 lg:grid-cols-[minmax(230px,0.75fr)_minmax(0,2fr)] lg:items-center lg:gap-12">
              <div className="lg:border-r lg:border-border lg:pr-10">
                <div className="flex items-center gap-4">
                  <span className="size-11 shrink-0 rounded-full bg-primary shadow-[0_8px_18px_rgba(254,80,0,0.2)] sm:size-12" aria-hidden="true" />
                  <h2 id="loyalty-points-title" className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground sm:text-sm">
                    {t('availablePoints')}
                  </h2>
                </div>
                {pointsLoading && pointsBalance === null ? (
                  <div className="mt-7 h-14 w-44 animate-pulse rounded-xl bg-muted" aria-label={t('rewardsLoading')} />
                ) : (
                  <p className="mt-7 font-display text-2xl font-extrabold leading-none text-primary sm:text-3xl">
                    {availablePoints.toLocaleString(locale)}
                    <span className="ml-2 text-xl font-semibold sm:text-2xl">{t('pointsUnit')}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                  <p className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                    {!freeIceCreamRewardEnabled
                      ? t('rewardProgramEndedTitle')
                      : pointsUntilReward > 0 ? t('almostThere') : t('rewardsTitle')}
                  </p>
                  <p className="text-sm font-bold text-primary sm:text-right sm:text-base">
                    {!freeIceCreamRewardEnabled
                      ? t('rewardProgramEndedDescription')
                      : pointsUntilReward > 0
                      ? t('pointsToNext', { count: pointsUntilReward.toLocaleString(locale) })
                      : t('rewardUnlocked')}
                  </p>
                </div>

                {freeIceCreamRewardEnabled ? (
                  <>
                    <div
                      className="mt-6 h-4 overflow-hidden rounded-full bg-muted sm:h-5"
                      role="progressbar"
                      aria-label={t('rewardsTitle')}
                      aria-valuemin={0}
                      aria-valuemax={rewardTargetPoints}
                      aria-valuenow={Math.min(availablePoints, rewardTargetPoints)}
                      aria-valuetext={pointsUntilReward > 0
                        ? t('pointsToNext', { count: pointsUntilReward.toLocaleString(locale) })
                        : t('rewardUnlocked')}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
                        style={{ width: pointsBalance === null ? '0%' : `${rewardProgress}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-bold text-muted-foreground sm:text-sm">
                      <span>{Math.min(REWARD_START_POINTS, rewardTargetPoints).toLocaleString(locale)} {t('pointsUnit')}</span>
                      <span>{rewardTargetPoints.toLocaleString(locale)} {t('pointsUnit')}</span>
                    </div>
                  </>
                ) : null}
              </div>
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
                      <select
                        value={profileDraft.country || 'VN'}
                        onChange={(event) => setProfileDraft((current) => ({ ...current, country: event.target.value }))}
                        className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="VN">{t('countryVietnam')}</option>
                      </select>
                    </label>
                  </div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {t('profileBio')}
                    <textarea
                      rows={3}
                      value={profileDraft.profile}
                      onChange={(event) => setProfileDraft((current) => ({ ...current, profile: event.target.value }))}
                      placeholder={t('profileBioPlaceholder')}
                      className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {tCheckout('province')}
                      <select
                        value={addressDraft.provinceId}
                        onChange={(event) => setAddressDraft((current) => ({ ...current, provinceId: event.target.value, areaId: '' }))}
                        className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">{tCheckout('provincePlaceholder')}</option>
                        {provinces.map((province) => (
                          <option key={province.id} value={province.id}>{province.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {tCheckout('district')}
                      <select
                        value={addressDraft.areaId}
                        disabled={!addressDraft.provinceId}
                        onChange={(event) => setAddressDraft((current) => ({ ...current, areaId: event.target.value }))}
                        className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                      >
                        <option value="">{tCheckout('districtPlaceholder')}</option>
                        {areaOptions.map((area) => (
                          <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {tCheckout('addressLine')}
                    <input
                      value={addressDraft.streetLine1}
                      onChange={(event) => setAddressDraft((current) => ({ ...current, streetLine1: event.target.value }))}
                      autoComplete="street-address"
                      className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
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

          {/* Lịch sử tích/trừ điểm; balance đã hiển thị ở overview phía trên. */}
          <PointsSection token={token} />

          {/* Lịch sử đơn hàng — dữ liệu thật từ /orders/my-orders */}
          <OrderHistory orders={orders} />
        </main>
      </div>
    </div>
  );
}
