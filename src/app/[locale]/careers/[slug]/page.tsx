import { ArrowLeft, BriefcaseBusiness, Clock3, MapPin } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { JOB_LISTINGS } from '@/features/careers/jobs';
import { CareersHero } from '@/sections/careers/careers-hero';

const DETAIL_SECTIONS = [
  { key: 'responsibilities', items: ['one', 'two', 'three'] },
  { key: 'requirements', items: ['one', 'two', 'three'] },
  { key: 'benefits', items: ['one', 'two', 'three'] },
] as const;

export default async function CareerDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const job = JOB_LISTINGS.find((listing) => listing.slug === slug);
  if (!job) notFound();

  const t = await getTranslations('careers');
  const title = t(`jobs.${job.contentKey}.title`);
  const description = t(`jobs.${job.contentKey}.description`);
  const subject = encodeURIComponent(t('detail.emailSubject', { title }));

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
            <DetailMeta icon={<BriefcaseBusiness className="size-5" aria-hidden="true" />} label={t('detail.group')} value={t(`options.groups.${job.group}`)} />
            <DetailMeta icon={<MapPin className="size-5" aria-hidden="true" />} label={t('detail.location')} value={t(`options.locations.${job.location}`)} />
            <DetailMeta icon={<Clock3 className="size-5" aria-hidden="true" />} label={t('detail.type')} value={t(`options.types.${job.type}`)} />
          </aside>

          <article className="rounded-xl border border-foreground/15 bg-card p-6 sm:p-9 lg:p-11">
            <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Mingo careers</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
              </div>
              <a href={`mailto:careers@hongtanphat.com?subject=${subject}`} className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-muted-foreground px-6 text-xs font-bold text-white transition-colors hover:bg-primary">
                {t('apply')}
              </a>
            </header>

            <section className="pt-8">
              <h3 className="text-xl font-bold">{t('detail.description')}</h3>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{description}</p>
            </section>

            {DETAIL_SECTIONS.map((section) => (
              <section key={section.key} className="mt-9">
                <h3 className="text-xl font-bold">{t(`detail.sections.${section.key}.title`)}</h3>
                <ul className="mt-4 space-y-3 text-base leading-7 text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <span>{t(`detail.sections.${section.key}.items.${item}`)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="mt-10 rounded-xl bg-blush p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <p className="text-sm font-semibold leading-6 text-foreground">{t('detail.applicationNote')}</p>
              <a href={`mailto:careers@hongtanphat.com?subject=${subject}`} className="mt-4 inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark sm:mt-0">
                {t('detail.sendApplication')}
              </a>
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
