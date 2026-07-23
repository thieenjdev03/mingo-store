import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCareers } from '@/features/careers/api';
import { toCareerView, type CareerView } from '@/features/careers/types';
import { CareersHero } from './careers-hero';

interface CareersSearchViewProps {
  query?: string;
  groups?: string[];
  locations?: string[];
  types?: string[];
}

async function fetchCareers(): Promise<CareerView[]> {
  try {
    const res = await getCareers({ status: 'published', limit: 100 });
    return res.items.map(toCareerView);
  } catch (err) {
    // API down/unreachable — render the empty state instead of crashing the page.
    console.error('[careers] fetch failed:', err);
    return [];
  }
}

export async function CareersSearchView({ query = '', groups = [], locations = [], types = [] }: CareersSearchViewProps) {
  const t = await getTranslations('careers');
  const allJobs = await fetchCareers();
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const jobs = allJobs.filter((job) => {
    const matchesQuery = !normalizedQuery || `${job.title} ${job.excerpt}`.toLocaleLowerCase().includes(normalizedQuery);
    const matchesGroup = groups.length === 0 || groups.includes(job.category);
    const matchesLocation = locations.length === 0 || locations.includes(job.location);
    const matchesType = types.length === 0 || types.includes(job.level);
    return matchesQuery && matchesGroup && matchesLocation && matchesType;
  });

  const distinct = (values: string[]) => [...new Set(values.filter(Boolean))];

  return (
    <div className="bg-background">
      <CareersHero query={query} />

      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[230px_1fr] lg:gap-12">
          <aside>
            <form method="get" className="space-y-8">
              <input type="hidden" name="q" value={query} />
              <FilterGroup title={t('filters.group')} name="group" values={distinct(allJobs.map((j) => j.category))} selected={groups} />
              <FilterGroup title={t('filters.location')} name="location" values={distinct(allJobs.map((j) => j.location))} selected={locations} />
              <FilterGroup title={t('filters.type')} name="type" values={distinct(allJobs.map((j) => j.level))} selected={types} />
              <button type="submit" className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">{t('filters.apply')}</button>
            </form>
          </aside>
          <div>
            {jobs.length > 0 ? (
              <div className="space-y-4" aria-live="polite">
                {jobs.map((job) => <JobCard key={job.slug} job={job} applyLabel={t('apply')} />)}
              </div>
            ) : (
              <div className="rounded-xl border border-foreground/15 bg-card px-6 py-16 text-center">
                <h2 className="text-xl font-bold">{t('noResults.title')}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t('noResults.description')}</p>
                <a href="/careers" className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-dark">{t('noResults.reset')}</a>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterGroup({ title, name, values, selected }: { title: string; name: string; values: string[]; selected: string[] }) {
  if (values.length === 0) return null;
  return (
    <fieldset>
      <legend className="font-display text-2xl font-normal text-foreground">{title}</legend>
      <div className="mt-4 space-y-3">
        {values.map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-3 text-sm text-foreground/75">
            <input type="checkbox" name={name} value={value} defaultChecked={selected.includes(value)} className="size-5 appearance-none rounded-md border border-foreground/70 bg-transparent checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
            <span>{value}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function JobCard({ job, applyLabel }: { job: CareerView; applyLabel: string }) {
  return (
    <article className="rounded-xl border border-foreground/15 bg-card px-6 py-6 sm:px-9 sm:py-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            <Link href={`/careers/${job.slug}`} className="transition-colors hover:text-primary">{job.title}</Link>
          </h2>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground sm:text-base">{job.excerpt}</p>
        </div>
        <Link href={`/careers/${job.slug}`} className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-muted-foreground px-6 text-xs font-bold text-white transition-colors hover:bg-primary">{applyLabel}</Link>
      </div>
    </article>
  );
}
