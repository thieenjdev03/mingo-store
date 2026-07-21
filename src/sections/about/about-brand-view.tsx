import { Mail, Phone, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const MAP_ADDRESS = '232/28 Đ. Tô Hiệu, Phú Thạnh, Hồ Chí Minh, Việt Nam';
const MAP_QUERY = encodeURIComponent(MAP_ADDRESS);
const MAP_EMBED_URL = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;
const MAP_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;

const DEPARTMENT_EMAILS = [
  { key: 'sales', email: 'sales@mingo.hongtanphat.com' },
  { key: 'hr', email: 'hr@mingo.hongtanphat.com' },
  { key: 'support', email: 'support@mingo.hongtanphat.com' },
  { key: 'external', email: 'pr@mingo.hongtanphat.com' },
] as const;

const STORE_KEYS = ['hoaTho', 'jMart', 'xomCui', 'phanVanHan'] as const;

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

interface FilterSelectProps {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

export async function AboutBrandView() {
  const t = await getTranslations('about');
  const lineOptions = [
    { value: 'bars', label: t('distribution.options.bars') },
    { value: 'boxes', label: t('distribution.options.boxes') },
    { value: 'cones', label: t('distribution.options.cones') },
  ];
  const productOptions = [
    { value: 'creme-caramel', label: t('distribution.options.creme') },
    { value: 'matcha-red-bean', label: t('distribution.options.matcha') },
  ];
  const cityOptions = [
    { value: 'ho-chi-minh', label: t('distribution.options.hcm') },
    { value: 'da-nang', label: t('distribution.options.daNang') },
  ];
  const districtOptions = [
    { value: 'district-1', label: t('distribution.options.district1') },
    { value: 'tan-phu', label: t('distribution.options.tanPhu') },
  ];

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

        <form action="#distribution" className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <SelectField name="line" label={t('distribution.line')} options={lineOptions} />
          <SelectField name="product" label={t('distribution.product')} options={productOptions} />
          <SelectField name="city" label={t('distribution.city')} options={cityOptions} />
          <SelectField name="district" label={t('distribution.district')} options={districtOptions} />
          <button type="submit" aria-label={t('distribution.search')} className="flex size-12 items-center justify-center justify-self-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-dark sm:col-span-2 lg:col-span-1 lg:justify-self-auto">
            <Search className="size-5" aria-hidden="true" />
          </button>
        </form>

        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card lg:grid lg:min-h-[520px] lg:grid-cols-[360px_1fr]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold text-primary">{t('distribution.found', { count: STORE_KEYS.length })}</p>
            <div className="mt-5 divide-y divide-foreground/45">
              {STORE_KEYS.map((key) => (
                <article key={key} className="py-5 first:pt-0">
                  <h3 className="text-base font-bold">{t(`distribution.stores.${key}.name`)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`distribution.stores.${key}.address`)}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="min-h-[420px] border-t border-border lg:min-h-full lg:border-l lg:border-t-0">
            <iframe
              src={MAP_EMBED_URL}
              title={t('distribution.mapTitle')}
              className="h-full min-h-[420px] w-full border-0 lg:min-h-[520px]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function SelectField({ name, label, options }: FilterSelectProps) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select id={`distribution-${name}`} name={name} defaultValue="" className="h-12 w-full rounded-full border border-muted-foreground/55 bg-card px-5 text-sm text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15">
        <option value="" disabled>{label}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
