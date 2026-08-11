import { ArrowLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getCareerBySlug } from '@/features/careers/api';
import { toCareerView } from '@/features/careers/types';
import { CareerApplicationForm } from '@/features/careers/application-form';

export default async function CareerDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const job = await getCareerBySlug(slug)
    .then(toCareerView)
    .catch(() => null);
  if (!job) notFound();

  const t = await getTranslations('careers');
  const meta = [job.category, job.location, job.level].filter(Boolean);

  return (
    <div className="bg-background">
      {/* Layout 1 cột, đọc dễ trên mọi kích thước (theo design). */}
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        <Link href="/careers" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('detail.back')}
        </Link>

        <header className="mt-6">
          <h1 className="font-display text-4xl font-bold uppercase leading-[1.05] text-primary sm:text-5xl">{job.title}</h1>
          {meta.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-x-2.5 gap-y-2" aria-label={t('detail.overview')}>
              {meta.map((value) => (
                <li key={value} className="rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary">
                  {value}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {/* Sanitized server-side by the backend (sanitize-html) before storage. */}
        <div
          className="mt-9 text-base leading-7 text-muted-foreground [&_h3]:mt-9 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-foreground [&_h3:first-child]:mt-0 [&_li]:leading-7 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-5 [&_ul_ul]:mt-3"
          dangerouslySetInnerHTML={{ __html: job.contentHtml }}
        />

        {job.related.length > 0 ? (
          <section className="mt-12 rounded-xl border border-foreground/12 bg-card p-6 sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{t('detail.related')}</h2>
            <ul className="mt-5 divide-y divide-border">
              {job.related.map((rel) => (
                <li key={rel.slug} className="py-4 first:pt-0 last:pb-0">
                  <Link href={`/careers/${rel.slug}`} className="text-lg font-bold text-foreground transition-colors hover:text-primary">
                    {rel.title}
                  </Link>
                  {rel.location ? <p className="mt-1 text-sm text-muted-foreground">{rel.location}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-12">
          <CareerApplicationForm careerId={job.id} jobTitle={job.title} />
        </div>
      </section>
    </div>
  );
}
