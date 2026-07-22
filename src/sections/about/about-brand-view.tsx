import { Mail, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { StoreLocator } from './store-locator';

const MAP_ADDRESS = '232/28 Đ. Tô Hiệu, Phú Thạnh, Hồ Chí Minh, Việt Nam';
const MAP_QUERY = encodeURIComponent(MAP_ADDRESS);
const MAP_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;

const DEPARTMENT_EMAILS = [
  { key: 'sales', email: 'sales@mingo.hongtanphat.com' },
  { key: 'hr', email: 'hr@mingo.hongtanphat.com' },
  { key: 'support', email: 'support@mingo.hongtanphat.com' },
  { key: 'external', email: 'pr@mingo.hongtanphat.com' },
] as const;

interface ContactPillProps {
  href: string;
  label: string;
  icon: 'mail' | 'phone';
  compact?: boolean;
}

function ContactPill({ href, label, icon, compact = false }: ContactPillProps) {
  const Icon = icon === 'phone' ? Phone : Mail;
  return (
    <a href={href} className={`inline-flex min-h-10 w-full items-center gap-2 rounded-full border-2 border-foreground/70 px-4 py-2 font-semibold transition-colors hover:border-primary hover:text-primary ${compact ? 'text-xs' : 'text-sm'}`}>
      <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 break-all">{label}</span>
    </a>
  );
}

export async function AboutBrandView() {
  const t = await getTranslations('about');

  return (
    <div className="bg-ivory">
      <section className="grid lg:grid-cols-2" aria-labelledby="about-story-title">
        <div className="flex min-h-[360px] flex-col bg-coral px-6 py-12 text-center sm:px-12 lg:min-h-[520px] lg:px-16 lg:py-14">
          <h1 id="about-story-title" className="font-display text-3xl font-bold text-foreground sm:text-4xl">{t('story.title')}</h1>
          <div className="flex flex-1 items-center justify-center">
            <p className="max-w-xl text-base font-bold leading-7 text-primary-foreground sm:text-lg">{t('story.belief')}</p>
          </div>
        </div>

        <div className="flex min-h-[440px] flex-col bg-butter px-6 py-12 text-center sm:px-12 lg:min-h-[520px] lg:px-16 lg:py-14">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{t('history.title')}</h2>
          <div className="flex flex-1 flex-col justify-center">
            <p className="mx-auto max-w-2xl text-base font-bold leading-7 text-primary">{t('history.kicker')}</p>
            <p className="mx-auto mt-12 max-w-2xl text-sm leading-6 text-foreground/85 sm:text-base">{t('history.paragraphOne')}</p>
            <p className="mx-auto mt-9 max-w-2xl text-sm leading-6 text-foreground/85 sm:text-base">{t('history.paragraphTwo')}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20" aria-labelledby="office-title">
        <div className="text-center">
          <h2 id="office-title" className="font-display text-4xl font-bold uppercase text-foreground sm:text-5xl lg:text-6xl">{t('office.country')}</h2>
          <p className="mt-7 inline-block border-b-2 border-primary text-xl font-bold text-primary sm:text-2xl">{t('office.tab')}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-8 text-center md:grid-cols-2 md:items-center">
          <address className="not-italic">
            <p className="text-lg font-bold">{t('office.company')}</p>
            <a href={MAP_SEARCH_URL} target="_blank" rel="noreferrer" className="mx-auto mt-3 block max-w-xs text-sm leading-6 text-muted-foreground transition-colors hover:text-primary">
              {t('office.address')}
            </a>
          </address>
          <div className="mx-auto w-full max-w-xs space-y-3 text-left">
            <ContactPill href="tel:+8437481009" label="037-481-009" icon="phone" />
            <ContactPill href="mailto:hongtanphatco@gmail.com" label="hongtanphatco@gmail.com" icon="mail" />
          </div>
        </div>

        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {DEPARTMENT_EMAILS.map((department) => (
            <div key={department.key} className="text-center">
              <h3 className="mb-3 text-base font-bold">{t(`departments.${department.key}`)}</h3>
              <ContactPill href={`mailto:${department.email}`} label={department.email} icon="mail" compact />
            </div>
          ))}
        </div>

        <div className="my-16 h-px bg-primary/55 lg:my-24" />

        <div id="distribution" className="scroll-mt-32 text-center">
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">{t('distribution.title')}</h2>
          <p className="mt-4 text-base text-muted-foreground">{t('distribution.description')}</p>
        </div>

        <StoreLocator />
      </section>
    </div>
  );
}
