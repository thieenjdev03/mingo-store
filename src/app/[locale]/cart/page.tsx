import { setRequestLocale } from 'next-intl/server';
import { CartPageContent } from '@/features/cart/cart-page-content';
import { NO_INDEX_METADATA } from '@/lib/seo';

export const metadata = NO_INDEX_METADATA;

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CartPageContent />;
}
