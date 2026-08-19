import { getCareers } from '@/features/careers/api';
import { toCareerView, type CareerView } from '@/features/careers/types';
import { CareersHero } from './careers-hero';
import { CareersSearchClient } from './careers-search-client';

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
  const allJobs = await fetchCareers();

  return (
    <div className="bg-background">
      <CareersHero query={query} />
      <CareersSearchClient jobs={allJobs} query={query} initialGroups={groups} initialLocations={locations} initialTypes={types} />
    </div>
  );
}
