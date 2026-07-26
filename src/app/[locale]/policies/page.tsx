import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPolicies, getPolicyBySlug } from '@/features/policies/api';

/**
 * Trang "Chính sách và hỗ trợ" — sidebar liệt kê các chính sách (GET /policies),
 * cột nội dung render HTML của chính sách đang chọn (GET /policies/:slug).
 * Chính sách đang xem lấy từ query ?policy=<slug>, mặc định là mục đầu tiên.
 * Content là HTML đã được backend sanitize -> render bằng dangerouslySetInnerHTML.
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
  const activeSlug =
    policyParam && policies.some((p) => p.slug === policyParam) ? policyParam : policies[0]?.slug;
  const active = activeSlug ? await getPolicyBySlug(activeSlug).catch(() => null) : null;

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(240px,300px)_1fr] lg:gap-16">
          {/* Sidebar: tiêu đề trang + danh sách chính sách */}
          <aside>
            <h1 className="font-display text-2xl font-bold text-primary sm:text-[28px]">{t('title')}</h1>
            {policies.length > 0 ? (
              <nav className="mt-6 flex flex-col gap-4 text-[15px]">
                {policies.map((p) => {
                  const isActive = p.slug === activeSlug;
                  return (
                    <Link
                      key={p.slug}
                      href={`/policies?policy=${p.slug}`}
                      aria-current={isActive ? 'page' : undefined}
                      className={
                        isActive
                          ? 'font-bold text-primary'
                          : 'text-foreground/75 transition-colors hover:text-primary'
                      }
                    >
                      {p.title}
                    </Link>
                  );
                })}
              </nav>
            ) : (
              <p className="mt-6 text-[15px] text-foreground/60">{t('empty')}</p>
            )}
          </aside>

          {/* Nội dung chính sách đang chọn */}
          <div className="min-w-0">
            {active ? (
              <article>
                <h2 className="font-display text-2xl font-bold text-primary sm:text-[32px]">{active.title}</h2>
                <div
                  className="mt-6 max-w-none text-[15px] leading-relaxed text-foreground/85 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-bold [&_table]:w-full [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
                  // eslint-disable-next-line react/no-danger -- content đã được backend sanitize (xem policies module)
                  dangerouslySetInnerHTML={{ __html: active.contentHtml }}
                />
              </article>
            ) : policies.length > 0 ? (
              <p className="text-[15px] text-foreground/60">{t('notFound')}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
