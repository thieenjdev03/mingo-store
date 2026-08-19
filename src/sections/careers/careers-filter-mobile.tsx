'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface CareersFilterGroup {
  title: string;
  /** Tên field gửi lên (group | location | type). */
  name: string;
  values: string[];
  selected: string[];
}

interface CareersFilterMobileProps {
  groups: CareersFilterGroup[];
  /** Số công việc khớp bộ lọc hiện tại (hiển thị ở "Hiển thị N công việc" + nút Áp dụng). */
  resultCount: number;
  onToggle: (name: 'group' | 'location' | 'type', value: string, checked: boolean) => void;
  onClear: () => void;
}

/**
 * Thanh kết quả + bộ lọc dạng drawer cho mobile/tablet (< lg).
 * Trên lg trở lên aside filter cố định đã hiển thị nên component này bị ẩn.
 * Form vẫn là GET thuần (giống aside desktop) — submit là điều hướng cả trang.
 */
export function CareersFilterMobile({ groups, resultCount, onToggle, onClear }: CareersFilterMobileProps) {
  const t = useTranslations('careers');
  const [open, setOpen] = useState(false);

  // Khóa cuộn nền khi drawer mở.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Đóng bằng phím Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t('filters.showing', { count: resultCount })}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted-foreground/15"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {t('filters.trigger')}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={t('filters.title')}>
          <button
            type="button"
            aria-label={t('filters.close')}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 animate-in fade-in"
          />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-background shadow-xl">
            <header className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
              <h2 className="font-display text-xl font-bold text-foreground">{t('filters.title')}</h2>
              <div className="flex items-center gap-3">
                <button type="button" onClick={onClear} className="text-sm font-semibold text-primary hover:underline">
                  {t('filters.clearAll')}
                </button>
                <button
                  type="button"
                  aria-label={t('filters.close')}
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-muted"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-6">
              {groups.filter((group) => group.values.length > 0).map((group) => (
                <fieldset key={group.name}>
                  <legend className="font-display text-lg font-normal text-foreground">{group.title}</legend>
                  <div className="mt-4 space-y-1">
                    {group.values.map((value) => (
                      <label
                        key={value}
                        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm text-foreground/80 transition-colors hover:bg-muted/60 has-[:checked]:bg-primary/10"
                      >
                        <input
                          type="checkbox"
                          value={value}
                          checked={group.selected.includes(value)}
                          onChange={(event) => onToggle(group.name as 'group' | 'location' | 'type', value, event.target.checked)}
                          className="size-5 appearance-none rounded-md border border-foreground/70 bg-transparent checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
