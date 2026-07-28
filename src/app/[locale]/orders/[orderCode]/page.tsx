import { setRequestLocale } from 'next-intl/server';
import { OrderDetailView } from '@/features/account/order-detail-view';

export default async function OrderDetailPage({ params }: { params: Promise<{ locale: string; orderCode: string }> }) {
  const { locale, orderCode } = await params;
  setRequestLocale(locale);
  return <OrderDetailView orderCode={orderCode} />;
}
