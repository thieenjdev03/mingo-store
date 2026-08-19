'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CareerView } from '@/features/careers/types';
import { CareersFilterMobile, type CareersFilterGroup } from './careers-filter-mobile';

type FilterKey = 'group' | 'location' | 'type';

interface CareersSearchClientProps {
  jobs: CareerView[];
  query: string;
  initialGroups: string[];
  initialLocations: string[];
  initialTypes: string[];
}

/** Filters run locally so a checkbox change updates the job list without a submit step. */
export function CareersSearchClient({
  jobs: allJobs,
  query,
  initialGroups,
  initialLocations,
  initialTypes,
}: CareersSearchClientProps) {
  const t = useTranslations('careers');
  const [selected, setSelected] = useState<Record<FilterKey, string[]>>({
    group: initialGroups,
    location: initialLocations,
    type: initialTypes,
  });
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const jobs = useMemo(
    () => allJobs.filter((job) => {
      const matchesQuery = !normalizedQuery || `${job.title} ${job.excerpt}`.toLocaleLowerCase().includes(normalizedQuery);
      return (
        matchesQuery &&
        (selected.group.length === 0 || selected.group.includes(job.category)) &&
        (selected.location.length === 0 || selected.location.includes(job.location)) &&
        (selected.type.length === 0 || selected.type.includes(job.level))
      );
    }),
    [allJobs, normalizedQuery, selected],
  );
  const distinct = (values: string[]) => [...new Set(values.filter(Boolean))];
  const filterGroups: CareersFilterGroup[] = [
    { title: t('filters.group'), name: 'group', values: distinct(allJobs.map((job) => job.category)), selected: selected.group },
    { title: t('filters.location'), name: 'location', values: distinct(allJobs.map((job) => job.location)), selected: selected.location },
    { title: t('filters.type'), name: 'type', values: distinct(allJobs.map((job) => job.level)), selected: selected.type },
  ];

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    (Object.entries(selected) as Array<[FilterKey, string[]]>).forEach(([name, values]) => {
      values.forEach((value) => params.append(name, value));
    });
    const search = params.toString();
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}`;
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [query, selected]);

  const toggleFilter = (name: FilterKey, value: string, checked: boolean) => {
    setSelected((current) => ({
      ...current,
      [name]: checked
        ? [...current[name], value]
        : current[name].filter((selectedValue) => selectedValue !== value),
    }));
  };

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
      <div className="mb-8 lg:hidden">
        <CareersFilterMobile
          groups={filterGroups}
          resultCount={jobs.length}
          onToggle={toggleFilter}
          onClear={() => setSelected({ group: [], location: [], type: [] })}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-[230px_1fr] lg:gap-12">
        <aside className="hidden lg:block space-y-8">
          {filterGroups.map((group) => (
            <FilterGroup key={group.name} group={group} onToggle={toggleFilter} />
          ))}
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
              <button type="button" onClick={() => setSelected({ group: [], location: [], type: [] })} className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-dark">
                {t('noResults.reset')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterGroup({ group, onToggle }: { group: CareersFilterGroup; onToggle: (name: FilterKey, value: string, checked: boolean) => void }) {
  if (group.values.length === 0) return null;
  return (
    <fieldset>
      <legend className="font-display text-2xl font-normal text-foreground">{group.title}</legend>
      <div className="mt-4 space-y-3">
        {group.values.map((value) => (
          <label key={value} className="flex min-h-9 cursor-pointer items-center gap-3 text-sm text-foreground/75">
            <input type="checkbox" checked={group.selected.includes(value)} onChange={(event) => onToggle(group.name as FilterKey, value, event.target.checked)} className="size-5 appearance-none rounded-md border border-foreground/70 bg-transparent checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-primary/30" />
            <span>{value}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function JobCard({ job, applyLabel }: { job: CareerView; applyLabel: string }) {
  return (
    <article className="rounded-xl border border-foreground/15 px-6 py-6 sm:px-9 sm:py-7">
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
