'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SelectField } from '@/components/ui/select';
import {
  provinces,
  getWardsByProvince,
  getStores,
  getCategoryOptions,
  type Province,
  type Ward,
  type Store,
  type CategoryOption,
} from '@/features/distribution/data';
import { extractMapsSrc } from '@/lib/maps-embed';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';

export function StoreLocator() {
  const t = useTranslations('stores');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [province, setProvince] = useState<Province | null>(null);
  const [ward, setWard] = useState<Ward | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    getCategoryOptions().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Server-side filtering — refetch whenever a filter changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStores({
      province_code: province?.id,
      ward_code: ward?.id,
      category_id: categoryId || undefined,
    })
      .then((data) => {
        if (cancelled) return;
        setStores(data);
        setActiveId((current) => (data.some((s) => s.id === current) ? current : (data[0]?.id ?? null)));
      })
      .catch(() => {
        if (!cancelled) setStores([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [province?.id, ward?.id, categoryId]);

  const wardOptions = useMemo(() => (province ? getWardsByProvince(province.id) : []), [province]);

  const active = stores.find((s) => s.id === activeId) ?? stores[0] ?? null;
  const mapSrc = active ? extractMapsSrc(active.maps_embed_src) : null;

  const addressOf = (s: Store) =>
    [s.address_line, s.ward_name, s.district_text, s.province_name].filter(Boolean).join(', ');

  return (
    <>
      <div className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <ComboSelect
          value={categoryId}
          onChange={setCategoryId}
          placeholder={t('line')}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        {/* product select: cosmetic for now — no data backing it yet (see spec) */}
        <ComboSelect
          value=""
          onChange={() => {}}
          placeholder={t('product')}
          disabled
          options={[
            { value: 'creme', label: t('options.creme') },
            { value: 'matcha', label: t('options.matcha') },
          ]}
        />
        <ComboSelect
          value={province?.id ?? ''}
          onChange={(id) => {
            setProvince(provinces.find((p) => p.id === id) ?? null);
            setWard(null);
          }}
          placeholder={t('city')}
          options={provinces.map((p) => ({ value: p.id, label: p.name }))}
        />
        <ComboSelect
          value={ward?.id ?? ''}
          onChange={(id) => setWard(wardOptions.find((w) => w.id === id) ?? null)}
          placeholder={t('ward')}
          disabled={!province}
          options={wardOptions.map((w) => ({ value: w.id, label: w.name }))}
        />
        <button
          type="button"
          aria-label={t('search')}
          className="flex size-12 items-center justify-center justify-self-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-dark sm:col-span-2 lg:col-span-1 lg:justify-self-auto"
        >
          <Search className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card lg:grid lg:min-h-[520px] lg:grid-cols-[360px_1fr]">
        <div className="p-6 sm:p-8">
          <p className="text-sm font-semibold text-primary">{t('found', { count: loading ? 0 : stores.length })}</p>
          {!loading && stores.length > 0 ? (
            <div className="mt-5 max-h-[440px] divide-y divide-foreground/45 overflow-y-auto">
              {stores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setActiveId(store.id)}
                  className={`block w-full py-5 text-left transition-colors first:pt-0 ${
                    store.id === active?.id ? 'text-primary' : 'hover:text-primary'
                  }`}
                >
                  <span className="block text-base font-bold">{store.name}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{addressOf(store)}</span>
                </button>
              ))}
            </div>
          ) : (
            loading ? <div className="mt-8"><MeltingIceCreamLoader size="sm" /></div> : <p className="mt-8 text-sm text-muted-foreground">{t('notFound')}</p>
          )}
        </div>
        <div className="min-h-[420px] border-t border-border lg:min-h-full lg:border-l lg:border-t-0">
          {mapSrc ? (
            <iframe
              src={mapSrc}
              title={t('mapTitle')}
              className="h-full min-h-[420px] w-full border-0 lg:min-h-[520px]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-muted-foreground lg:min-h-[520px]">
              {t('notFound')}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface ComboSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

function ComboSelect({ value, onChange, placeholder, options, disabled }: ComboSelectProps) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <SelectField
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        options={[{ value: '', label: placeholder }, ...options]}
        className="rounded-full px-5 text-sm"
        aria-label={placeholder}
      />
    </label>
  );
}
