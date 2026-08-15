import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CareersSearchView } from '@/sections/careers/careers-search-view';
import { pageMetadata, toSeoLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = toSeoLocale(locale);
  return pageMetadata({
    locale: seoLocale,
    pathname: '/careers',
    title: seoLocale === 'vi' ? 'Tuyển dụng tại Mingo Ice Cream — Cơ hội nghề nghiệp' : 'Careers at Mingo Ice Cream — Job opportunities',
    description: seoLocale === 'vi' ? 'Khám phá các vị trí tuyển dụng và cơ hội phát triển sự nghiệp cùng Mingo Ice Cream tại Việt Nam.' : 'Explore open roles and career opportunities with Mingo Ice Cream in Vietnam.',
  });
}

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
