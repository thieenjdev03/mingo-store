import { setRequestLocale } from 'next-intl/server';
import { NO_INDEX_METADATA } from '@/lib/seo';
import { OrderDetailView } from '@/features/account/order-detail-view';

export const metadata = { ...NO_INDEX_METADATA, referrer: 'no-referrer' as const };

interface GuestOrderPageProps {
  params: Promise<{ locale: string; orderCode: string }>;
}

export default async function GuestOrderPage({ params }: GuestOrderPageProps) {
  const { locale, orderCode } = await params;
  setRequestLocale(locale);
  return <OrderDetailView orderCode={orderCode} guest />;
}
