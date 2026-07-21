import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { JOB_GROUPS, JOB_LISTINGS, JOB_LOCATIONS, JOB_TYPES, type JobListing } from '@/features/careers/jobs';
import { CareersHero } from './careers-hero';

interface CareersSearchViewProps {
  query?: string;
  groups?: string[];
  locations?: string[];
  types?: string[];
}

export async function CareersSearchView({ query = '', groups = [], locations = [], types = [] }: CareersSearchViewProps) {
  const t = await getTranslations('careers');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const jobs = JOB_LISTINGS.map((job) => ({
    ...job,
    title: t(`jobs.${job.contentKey}.title`),
    description: t(`jobs.${job.contentKey}.description`),
  })).filter((job) => {
    const matchesQuery = !normalizedQuery || `${job.title} ${job.description}`.toLocaleLowerCase().includes(normalizedQuery);
    const matchesGroup = groups.length === 0 || groups.includes(job.group);
    const matchesLocation = locations.length === 0 || locations.includes(job.location);
    const matchesType = types.length === 0 || types.includes(job.type);
    return matchesQuery && matchesGroup && matchesLocation && matchesType;
  });
  const paginationParams = new URLSearchParams();
  if (query) paginationParams.set('q', query);
  groups.forEach((group) => paginationParams.append('group', group));
  locations.forEach((location) => paginationParams.append('location', location));
  types.forEach((type) => paginationParams.append('type', type));
  const pageHref = (page: number) => {
    const params = new URLSearchParams(paginationParams);
    params.set('page', String(page));
    return `?${params.toString()}`;
  };

  return (
    <div className="bg-background">
      <CareersHero query={query} />

      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[230px_1fr] lg:gap-12">
          <CareersFilters t={t} query={query} groups={groups} locations={locations} types={types} />
          <div>
            {jobs.length > 0 ? (
              <div className="space-y-4" aria-live="polite">
                {jobs.map((job) => <JobCard key={job.slug} job={job} t={t} />)}
              </div>
            ) : (
              <div className="rounded-xl border border-foreground/15 bg-card px-6 py-16 text-center">
                <h2 className="text-xl font-bold">{t('noResults.title')}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t('noResults.description')}</p>
                <a href="/careers" className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-dark">{t('noResults.reset')}</a>
              </div>
            )}
            <nav aria-label={t('pagination.label')} className="mt-12 flex items-center justify-center gap-7 text-sm">
              {Array.from({ length: 9 }, (_, index) => index + 1).map((page) => (
                <a key={page} href={pageHref(page)} className={`transition-colors hover:text-primary ${page === 1 ? 'font-bold text-foreground' : 'text-foreground/75'}`}>{page}</a>
              ))}
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
}

type CareersTranslator = Awaited<ReturnType<typeof getTranslations>>;

function CareersFilters({ t, query, groups, locations, types }: { t: CareersTranslator; query: string; groups: string[]; locations: string[]; types: string[] }) {
  return (
    <aside>
      <form method="get" className="space-y-8">
        <input type="hidden" name="q" value={query} />
        <FilterGroup title={t('filters.group')} name="group" options={JOB_GROUPS.map((value) => ({ value, label: t(`options.groups.${value}`) }))} selected={groups} />
        <FilterGroup title={t('filters.location')} name="location" options={JOB_LOCATIONS.map((value) => ({ value, label: t(`options.locations.${value}`) }))} selected={locations} />
        <FilterGroup title={t('filters.type')} name="type" options={JOB_TYPES.map((value) => ({ value, label: t(`options.types.${value}`) }))} selected={types} />
        <button type="submit" className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">{t('filters.apply')}</button>
      </form>
    </aside>
  );
}

function FilterGroup({ title, name, options, selected }: { title: string; name: string; options: Array<{ value: string; label: string }>; selected: string[] }) {
  return (
    <fieldset>
      <legend className="font-display text-2xl font-normal text-foreground">{title}</legend>
      <div className="mt-4 space-y-3">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-foreground/75">
            <input type="checkbox" name={name} value={option.value} defaultChecked={selected.includes(option.value)} className="size-5 appearance-none rounded-md border border-foreground/70 bg-transparent checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function JobCard({ job, t }: { job: JobListing & { title: string; description: string }; t: CareersTranslator }) {
  return (
    <article className="rounded-xl border border-foreground/15 bg-card px-6 py-6 sm:px-9 sm:py-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">{job.title}</h2>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground sm:text-base">{job.description}</p>
        </div>
        <Link href={`/careers/${job.slug}`} className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-muted-foreground px-6 text-xs font-bold text-white transition-colors hover:bg-primary">{t('apply')}</Link>
      </div>
    </article>
  );
}
