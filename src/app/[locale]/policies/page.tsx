import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPolicies, getPolicyBySlug } from '@/features/policies/api';
import type { PolicyDetailView } from '@/features/policies/types';
import { PoliciesAccordion } from '@/features/policies/policies-accordion';

/**
 * Trang "Chính sách và hỗ trợ" — danh sách chính sách dạng accordion (GET /policies),
 * nội dung mỗi mục (GET /policies/:slug) render inline khi bung.
 * ?policy=<slug> mở sẵn mục tương ứng. Content là HTML đã được backend sanitize.
 */
export default async function PoliciesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ policy?: string }>;
}) {
  const { locale } = await params;
  const { policy: policyParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('pages.policies');

  const policies = await getPolicies().catch(() => []);
  // Lấy content của tất cả chính sách để đổ vào accordion (số lượng ít).
  const details = (
    await Promise.all(policies.map((p) => getPolicyBySlug(p.slug).catch(() => null)))
  ).filter((p): p is PolicyDetailView => p !== null);

  const defaultSlug =
    policyParam && details.some((p) => p.slug === policyParam) ? policyParam : undefined;

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <h1 className="font-display text-[32px] font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
          {t('title')}
        </h1>

        {details.length > 0 ? (
          <PoliciesAccordion items={details} defaultSlug={defaultSlug} />
        ) : (
          <p className="mt-8 text-[15px] text-foreground/60">{t('empty')}</p>
        )}
      </div>
    </div>
  );
}
