'use client';

import { useTranslations } from 'next-intl';
import { Search, ShoppingBag, User } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/features/cart/cart-context';

const NAV = [
  { key: 'products', href: '/san-pham' },
  { key: 'brands', href: '/thuong-hieu' },
  { key: 'partnership', href: '/hop-tac' },
  { key: 'about', href: '/ve-mingo' },
] as const;

export function SiteHeader() {
  const t = useTranslations('nav');
  const { totalQuantity } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 md:px-8">
        <Link href="/" className="font-display text-3xl font-bold text-primary" aria-label="Mingo — trang chủ">
          Mingo
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label={t('mainNav')}>
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-bold uppercase tracking-wide hover:text-primary"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/tai-khoan" aria-label={t('account')} className="hover:text-primary">
            <User className="size-6" />
          </Link>
          <Link href="/gio-hang" aria-label={t('cart')} className="relative hover:text-primary">
            <ShoppingBag className="size-6" />
            {totalQuantity > 0 && (
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalQuantity}
              </span>
            )}
          </Link>
          <button type="button" aria-label={t('search')} className="hover:text-primary">
            <Search className="size-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
