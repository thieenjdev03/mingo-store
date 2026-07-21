import { setRequestLocale } from 'next-intl/server';
import { CareersSearchView } from '@/sections/careers/careers-search-view';

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function CareersPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  return <CareersSearchView query={typeof query.q === 'string' ? query.q : ''} groups={toArray(query.group)} locations={toArray(query.location)} types={toArray(query.type)} />;
}
