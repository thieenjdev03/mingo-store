import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function StorefrontNotFound() {
  const t = useTranslations('notFound');

  return (
    <section className="mx-auto flex max-w-[1440px] flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-28">
      <p className="font-display text-[88px] font-extrabold leading-none text-primary sm:text-[140px]">404</p>
      <h1 className="mt-4 font-display text-[28px] font-bold leading-[1.1] text-foreground sm:text-[40px]">
        {t('title')}
      </h1>
      <p className="mt-4 max-w-[520px] text-base text-muted-foreground sm:text-lg">{t('description')}</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">{t('home')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">{t('products')}</Link>
        </Button>
      </div>
    </section>
  );
}
