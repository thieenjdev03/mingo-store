import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { VnpayReturnView } from '@/features/checkout/vnpay-return-view';
import { NO_INDEX_METADATA } from '@/lib/seo';

export const metadata = NO_INDEX_METADATA;

export default async function VnpayReturnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="bg-ivory py-20 text-center text-muted-foreground">…</div>}>
      <VnpayReturnView />
    </Suspense>
  );
}
