import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getCareerBySlug, getCareers } from '@/features/careers/api';
import { toCareerView } from '@/features/careers/types';
import { CareerApplicationForm } from '@/features/careers/application-form';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl, localizedPath, pageMetadata, seoDescription, toSeoLocale } from '@/lib/seo';

// TODO(cache): bật lại sau khi test xong
// export const revalidate = 300;
export const revalidate = 0;
// TODO(cache): bật lại sau khi test xong
// export const dynamic = 'force-static';

export async function generateStaticParams() {
  const careers = await getCareers({ status: 'published', limit: 100 })
    .then((response) => response.items)
    .catch(() => []);
  return careers.map((career) => ({ slug: career.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const seoLocale = toSeoLocale(locale);
  const job = await getCareerBySlug(slug).then(toCareerView).catch(() => null);
  const title = job?.title ?? (seoLocale === 'vi' ? 'Vị trí tuyển dụng' : 'Open position');
  return pageMetadata({
    locale: seoLocale,
    pathname: `/careers/${slug}`,
    title: seoLocale === 'vi' ? `${title} — Tuyển dụng Mingo Ice Cream` : `${title} — Careers at Mingo Ice Cream`,
    description: seoDescription(job?.excerpt, seoLocale === 'vi' ? `Ứng tuyển vị trí ${title} tại Mingo Ice Cream.` : `Apply for the ${title} position at Mingo Ice Cream.`),
  });
}

export default async function CareerDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const apiJob = await getCareerBySlug(slug).catch(() => null);
  if (!apiJob) notFound();
  const job = toCareerView(apiJob);

  const t = await getTranslations('careers');
  const meta = [job.category, job.location, job.level].filter(Boolean);

  return (
    <div className="bg-fog">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.contentHtml,
        datePosted: apiJob.published_at ?? apiJob.created_at,
        hiringOrganization: {
          '@type': 'Organization',
          name: 'Mingo Ice Cream',
          sameAs: absoluteUrl('/'),
          logo: absoluteUrl('/icon.png'),
        },
        jobLocation: job.location ? {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.location,
            addressCountry: 'VN',
          },
        } : undefined,
        url: absoluteUrl(localizedPath(locale, `/careers/${job.slug}`)),
      }} />
      <section className="relative isolate min-h-[340px] overflow-hidden bg-card sm:min-h-[410px]" aria-labelledby="career-title">
        <div className="pointer-events-none absolute inset-y-0 right-0 -z-0 hidden w-[68%] sm:block" aria-hidden="true">
          <Image
            src="/assets/mingo/m-stroke-orange.png"
            alt=""
            fill
            priority
            sizes="68vw"
            className="object-contain object-right"
          />
        </div>
        <header className="relative z-10 mx-auto flex min-h-[340px] max-w-[1200px] items-center px-5 sm:min-h-[410px] sm:px-8">
          <div className="max-w-[600px] sm:max-w-[55%]">
            <h1 id="career-title" className="font-display text-4xl font-bold uppercase leading-[1.05] text-primary sm:text-5xl lg:text-[56px]">
              {job.title}
            </h1>
          {meta.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-2.5" aria-label={t('detail.overview')}>
              {meta.map((value) => (
                  <li key={value} className="rounded-full border border-foreground/25 bg-card px-4 py-1 text-xs font-medium text-muted-foreground">
                  {value}
                </li>
              ))}
            </ul>
          ) : null}
          </div>
        </header>
      </section>

      <main className="mx-auto grid max-w-[1200px] items-start gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,760px)_minmax(280px,360px)] lg:gap-16 lg:py-20">
        <div className="min-w-0">
          <Link href="/careers" className="mb-8 inline-flex text-sm font-bold text-muted-foreground transition-colors hover:text-primary">
            {t('detail.back')}
          </Link>

          {/* Sanitized server-side by the backend (sanitize-html) before storage. */}
          <div
            className="text-lg leading-[1.35] text-muted-foreground [&_h3]:mb-5 [&_h3]:mt-10 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-primary [&_h3:first-child]:mt-0 [&_li]:leading-[1.35] [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-7 [&_ul_ul]:mt-1"
            dangerouslySetInnerHTML={{ __html: job.contentHtml }}
          />

          <section className="mt-14" aria-labelledby="apply-heading">
            <h2 id="apply-heading" className="font-display text-2xl font-bold text-primary sm:text-3xl">{t('apply')}</h2>
            <div className="mt-7">
              <CareerApplicationForm careerId={job.id} jobTitle={job.title} />
            </div>
          </section>
        </div>

        {job.related.length > 0 ? (
          <aside className="rounded-3xl border border-foreground/15 bg-transparent p-5 lg:sticky lg:top-28">
            <h2 className="text-lg font-medium text-muted-foreground">{t('detail.related')}</h2>
            <ul className="mt-4 divide-y divide-border">
              {job.related.map((rel) => (
                <li key={rel.slug} className="py-5">
                  <Link href={`/careers/${rel.slug}`} className="text-base font-bold text-muted-foreground transition-colors hover:text-primary">
                    {rel.title}
                  </Link>
                  {rel.location ? <p className="mt-2 text-xs text-muted-foreground/75">{rel.location}</p> : null}
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </main>
    </div>
  );
}
