'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MingoMascotLoader } from './melting-ice-cream-loader';

/**
 * Loader chỉ mount phía client.
 *
 * `loading.tsx` của App Router được dùng cho HAI việc: shell khi stream HTML lần đầu,
 * và fallback khi điều hướng client-side. Chỉ việc thứ hai là UX thật; việc thứ nhất
 * nhét chữ "Đang tải…" vào HTML server-render của mọi trang, che nội dung cần index.
 * Render null ở lần render đầu (server + hydrate) nên HTML server hoàn toàn sạch chữ,
 * còn mọi lần chuyển trang phía client vẫn thấy đủ mascot + label.
 */
export function ClientOnlyLoader({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('common');

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return <MingoMascotLoader label={t('loading')} size={size} />;
}
