import { setRequestLocale } from 'next-intl/server';
import { OrdersView } from '@/features/account/orders-view';

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OrdersView />;
}
