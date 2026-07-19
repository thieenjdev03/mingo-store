/**
 * Backend lưu các field đa ngôn ngữ dạng JSONB { en, vi } (xem tài liệu backend §3.1).
 * Mọi resolve đa ngôn ngữ đi qua đây — component KHÔNG tự đọc .vi/.en.
 */
export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export type LocalizedString = Partial<Record<Locale, string | null>>;

/** Resolve theo locale, fallback: locale -> vi -> en -> '' */
export function resolveLocalized(value: LocalizedString | string | null | undefined, locale: Locale): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? value.vi ?? value.en ?? '';
}
