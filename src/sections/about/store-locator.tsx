'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PROVINCES, getDistricts, getStores, type ProductLine, type Store } from '@/features/distribution/data';

const LINE_OPTIONS: ProductLine[] = ['bars', 'boxes', 'cones'];

export function StoreLocator() {
  const t = useTranslations('about.distribution');
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [line, setLine] = useState<ProductLine | ''>('');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load once via the data-access layer; realtime filtering happens client-side
  // below. When this moves to a real API, call getStores(filters) per change instead.
  useEffect(() => {
    getStores().then((stores) => {
      setAllStores(stores);
      const random = stores[Math.floor(Math.random() * stores.length)];
      if (random) setActiveId(random.id);
    });
  }, []);

  const districts = useMemo(() => (province ? getDistricts(province) : []), [province]);

  const filtered = useMemo(
    () =>
      allStores.filter(
        (s) =>
          (!province || s.province === province) &&
          (!district || s.district === district) &&
          (!line || s.productLines.includes(line)),
      ),
    [allStores, province, district, line],
  );

  const active = allStores.find((s) => s.id === activeId) ?? filtered[0] ?? null;
  const mapSrc = active
    ? `https://www.google.com/maps?q=${active.lat},${active.lng}&z=16&output=embed`
    : `https://www.google.com/maps?q=10.7769,106.7009&z=12&output=embed`;

  return (
    <>
      <div className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <Select value={line} onChange={(v) => setLine(v as ProductLine | '')} placeholder={t('line')}
          options={LINE_OPTIONS.map((v) => ({ value: v, label: t(`options.${v}`) }))} />
        {/* product select: cosmetic for now — no data backing it yet (see spec) */}
        <Select value="" onChange={() => {}} placeholder={t('product')} disabled
          options={[{ value: 'creme', label: t('options.creme') }, { value: 'matcha', label: t('options.matcha') }]} />
        <Select value={province} onChange={(v) => { setProvince(v); setDistrict(''); }} placeholder={t('city')}
          options={PROVINCES.map((p) => ({ value: p.code, label: p.name }))} />
        <Select value={district} onChange={setDistrict} placeholder={t('district')} disabled={!province}
          options={districts.map((d) => ({ value: d.code, label: d.name }))} />
        <button type="button" aria-label={t('search')} className="flex size-12 items-center justify-center justify-self-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-dark sm:col-span-2 lg:col-span-1 lg:justify-self-auto">
          <Search className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card lg:grid lg:min-h-[520px] lg:grid-cols-[360px_1fr]">
        <div className="p-6 sm:p-8">
          <p className="text-sm font-semibold text-primary">{t('found', { count: filtered.length })}</p>
          {filtered.length > 0 ? (
            <div className="mt-5 max-h-[440px] divide-y divide-foreground/45 overflow-y-auto">
              {filtered.map((store) => (
                <button key={store.id} type="button" onClick={() => setActiveId(store.id)}
                  className={`block w-full py-5 text-left transition-colors first:pt-0 ${store.id === active?.id ? 'text-primary' : 'hover:text-primary'}`}>
                  <span className="block text-base font-bold">{store.name}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{store.address}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">{t('notFound')}</p>
          )}
        </div>
        <div className="min-h-[420px] border-t border-border lg:min-h-full lg:border-l lg:border-t-0">
          <iframe src={mapSrc} title={t('mapTitle')} className="h-full min-h-[420px] w-full border-0 lg:min-h-[520px]" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

function Select({ value, onChange, placeholder, options, disabled }: SelectProps) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="h-12 w-full rounded-full border border-muted-foreground/55 bg-card px-5 text-sm text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50">
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
