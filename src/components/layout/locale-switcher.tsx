'use client';

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';

const LOCALES = ['vi', 'en'] as const;
type Locale = (typeof LOCALES)[number];

const switcherClass = 'flex items-center whitespace-nowrap text-[12px] font-semibold leading-4';

export function LocaleSwitcher() {
  return (
    <Suspense fallback={<span className={switcherClass} aria-label="Chuyển ngôn ngữ / Switch language">VI | EN</span>}>
      <LocaleSwitcherContent />
    </Suspense>
  );
}

function LocaleSwitcherContent() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    // TODO(slug): slug sản phẩm hiện dùng chung cho vi/en; nếu backend tách slug theo locale,
    // resolve slug mới trước khi replace route.
    const query = searchParams.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { locale: nextLocale });
  };

  return (
    <div className={switcherClass} aria-label="Chuyển ngôn ngữ / Switch language">
      {LOCALES.map((item, index) => (
        <span key={item} className="flex items-center">
          {index > 0 ? <span className="px-1 text-[#b8b0aa]" aria-hidden="true">|</span> : null}
          <button
            type="button"
            onClick={() => switchLocale(item)}
            aria-current={locale === item ? 'page' : undefined}
            className={locale === item ? 'font-bold text-primary' : 'text-[#9a918a] transition-colors hover:text-primary'}
          >
            {item.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
