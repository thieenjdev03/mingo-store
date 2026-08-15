import { setRequestLocale } from 'next-intl/server';
import { OrdersView } from '@/features/account/orders-view';
import { NO_INDEX_METADATA } from '@/lib/seo';

export const metadata = NO_INDEX_METADATA;

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OrdersView />;
}
