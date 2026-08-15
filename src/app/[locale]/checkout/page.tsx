import { setRequestLocale } from 'next-intl/server';
import { CheckoutView } from '@/features/checkout/checkout-view';
import { NO_INDEX_METADATA } from '@/lib/seo';

export const metadata = NO_INDEX_METADATA;

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CheckoutView />;
}
