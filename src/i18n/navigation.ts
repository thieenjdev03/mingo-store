import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Dùng Link/redirect/usePathname/useRouter từ file này thay vì next/link,
// để mọi điều hướng tự mang theo locale.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
