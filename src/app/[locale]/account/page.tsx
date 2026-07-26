import { setRequestLocale } from 'next-intl/server';
import { AccountPageView } from '@/features/account/account-view';

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AccountPageView />;
}
