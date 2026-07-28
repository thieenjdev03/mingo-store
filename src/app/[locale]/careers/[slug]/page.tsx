import { ArrowLeft, BriefcaseBusiness, Clock3, MapPin } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getCareerBySlug } from '@/features/careers/api';
import { toCareerView } from '@/features/careers/types';
import { CareerApplicationForm } from '@/features/careers/application-form';
import { CareersHero } from '@/sections/careers/careers-hero';

export default async function CareerDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const job = await getCareerBySlug(slug)
    .then(toCareerView)
    .catch(() => null);
  if (!job) notFound();

  const t = await getTranslations('careers');

  return (
    <div className="bg-background">
      <CareersHero />
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <Link href="/careers" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('detail.back')}
        </Link>

        <div className="mt-7 grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
          <aside className="space-y-8 lg:pt-3" aria-label={t('detail.overview')}>
            {job.category ? <DetailMeta icon={<BriefcaseBusiness className="size-5" aria-hidden="true" />} label={t('detail.group')} value={job.category} /> : null}
            {job.location ? <DetailMeta icon={<MapPin className="size-5" aria-hidden="true" />} label={t('detail.location')} value={job.location} /> : null}
            {job.level ? <DetailMeta icon={<Clock3 className="size-5" aria-hidden="true" />} label={t('detail.type')} value={job.level} /> : null}
          </aside>

          <article className="rounded-xl border border-foreground/15 bg-card p-6 sm:p-9 lg:p-11">
            <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mingo careers</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">{job.title}</h2>
              </div>
              <a href="#apply-form" className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-muted-foreground px-6 text-xs font-bold text-white transition-colors hover:bg-primary">
                {t('apply')}
              </a>
            </header>

            {/* Sanitized server-side by the backend (sanitize-html) before storage. */}
            <div
              className="pt-8 text-base leading-7 text-muted-foreground [&_h3]:mt-9 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-foreground [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: job.contentHtml }}
            />

            {job.related.length > 0 ? (
              <section className="mt-10 border-t border-border pt-8">
                <h3 className="text-xl font-bold">{t('detail.related')}</h3>
                <ul className="mt-4 space-y-3">
                  {job.related.map((rel) => (
                    <li key={rel.slug}>
                      <Link href={`/careers/${rel.slug}`} className="font-semibold text-primary transition-colors hover:text-primary-dark">{rel.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="mt-10">
              <CareerApplicationForm careerId={job.id} jobTitle={job.title} />
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function DetailMeta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary">{icon}<h3 className="font-display text-2xl font-normal text-foreground">{label}</h3></div>
      <p className="mt-3 pl-7 text-sm font-semibold text-muted-foreground">{value}</p>
    </div>
  );
}
