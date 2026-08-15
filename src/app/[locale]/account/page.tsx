import { setRequestLocale } from 'next-intl/server';
import { AccountPageView } from '@/features/account/account-view';
import { NO_INDEX_METADATA } from '@/lib/seo';

export const metadata = NO_INDEX_METADATA;

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AccountPageView />;
}
