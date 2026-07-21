import { MapPin, Package, Pencil, UserRound } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('account');

  const profile = [
    { label: t('name'), value: 'Nguyễn Minh Anh' },
    { label: t('email'), value: 'minhanh@example.com' },
    { label: t('phone'), value: '090 123 4567' },
    { label: t('address'), value: 'Quận 1, TP. Hồ Chí Minh' },
  ];

  return (
    <div className="bg-ivory py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mingo members</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-foreground sm:text-5xl">{t('title')}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t('description')}</p>
          </div>
          <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary">{t('logout')}</Link>
        </div>

        <div className="mt-8 rounded-lg bg-blush px-5 py-4 text-sm leading-6 text-primary">{t('mockNote')}</div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-xl bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">MA</span>
                <div>
                  <h2 className="text-xl font-bold">{t('welcome')}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Mingo Member</p>
                </div>
              </div>
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
                <Pencil className="size-4" aria-hidden="true" />
                {t('edit')}
              </button>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <UserRound className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold">{t('profile')}</h2>
            </div>
            <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {profile.map((item) => (
                <div key={item.label} className="rounded-lg bg-background px-4 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                  <dd className="mt-1.5 font-semibold text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="flex flex-col rounded-xl bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold">{t('orders')}</h2>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-blush text-primary"><MapPin className="size-6" aria-hidden="true" /></span>
              <p className="mt-4 text-sm text-muted-foreground">{t('ordersEmpty')}</p>
            </div>
            <Link href="/orders" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">{t('viewOrders')}</Link>
          </section>
        </div>
      </div>
    </div>
  );
}
