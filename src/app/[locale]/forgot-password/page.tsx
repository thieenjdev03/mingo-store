import { setRequestLocale } from 'next-intl/server';
import { CustomerAuthForm } from '@/features/account/customer-auth-form';
import { NO_INDEX_METADATA } from '@/lib/seo';

export const metadata = NO_INDEX_METADATA;

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CustomerAuthForm mode="forgot" />;
}
