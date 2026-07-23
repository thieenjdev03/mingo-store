import type { CareerDto } from '@/lib/api/generated/ecomAPI.schemas';

/** Tier-2 view model — components never touch CareerDto directly. */
export interface CareerView {
  slug: string;
  title: string;
  category: string;
  location: string;
  level: string;
  /** Plain-text excerpt derived from the sanitized HTML content. */
  excerpt: string;
  /** Sanitized HTML from the backend (sanitize-html server-side). */
  contentHtml: string;
  related: Array<{ slug: string; title: string }>;
}

export function toCareerView(api: CareerDto): CareerView {
  return {
    slug: api.slug,
    title: api.title,
    category: api.category ?? '',
    location: api.location ?? '',
    level: api.level ?? '',
    excerpt: stripHtml(api.content).slice(0, 240),
    contentHtml: api.content,
    related: (api.subCareers ?? []).map((sub) => ({ slug: sub.slug, title: sub.title })),
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
