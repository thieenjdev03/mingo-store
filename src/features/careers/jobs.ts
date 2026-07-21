export const JOB_GROUPS = ['admin', 'sales', 'marketing', 'human-resources', 'finance-accounting', 'other'] as const;
export const JOB_LOCATIONS = ['ho-chi-minh', 'ha-noi'] as const;
export const JOB_TYPES = ['admin', 'manager', 'intern', 'fresher', 'other'] as const;

export type JobGroup = (typeof JOB_GROUPS)[number];
export type JobLocation = (typeof JOB_LOCATIONS)[number];
export type JobType = (typeof JOB_TYPES)[number];

export interface JobListing {
  slug: string;
  contentKey: 'contentMarketing' | 'contentMarketingIntern';
  group: JobGroup;
  location: JobLocation;
  type: JobType;
}

export const JOB_LISTINGS: JobListing[] = [
  { slug: 'content-marketing', contentKey: 'contentMarketing', group: 'marketing', location: 'ho-chi-minh', type: 'manager' },
  { slug: 'content-marketing-intern', contentKey: 'contentMarketingIntern', group: 'marketing', location: 'ho-chi-minh', type: 'intern' },
  { slug: 'brand-content-marketing', contentKey: 'contentMarketing', group: 'marketing', location: 'ho-chi-minh', type: 'fresher' },
  { slug: 'brand-content-marketing-intern', contentKey: 'contentMarketingIntern', group: 'marketing', location: 'ha-noi', type: 'intern' },
];
