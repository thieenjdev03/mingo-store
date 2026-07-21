import { setRequestLocale } from 'next-intl/server';
import { MingoHomeView } from '@/sections/mingo-home/mingo-home-view';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MingoHomeView />;
}
