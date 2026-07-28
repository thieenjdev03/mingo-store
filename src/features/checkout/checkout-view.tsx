'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { MapPin, ShoppingBag, Truck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/features/cart/cart-context';
import { getAccessToken, clearAccessToken } from '@/lib/auth/token';
import { meControllerGetMe } from '@/lib/api/generated/me/me';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { fCurrencyVND } from '@/lib/format';
import { provinces, type Province } from '@/lib/vn-address';
import { createCheckoutOrder, quoteCheckout, quoteShipping, upsertShippingAddress } from './api';
import { getShippingAreas, type ShippingAreaOption } from './shipping-locations';
import type { CheckoutQuoteView, ShippingAddressInput, ShippingQuoteView } from './types';

interface PreparedCheckout {
  shippingAddressId: string;
  provinceCode: string;
  districtCode: string;
  notes?: string;
  quote: CheckoutQuoteView;
}

type Step = 'checking-auth' | 'form' | 'quoting' | 'redirecting';

export function CheckoutView() {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const cart = useCart();
  const [step, setStep] = useState<Step>('checking-auth');
  const [userId, setUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [province, setProvince] = useState<Province | null>(null);
  const [area, setArea] = useState<ShippingAreaOption | null>(null);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuoteView | null>(null);
  const [prepared, setPrepared] = useState<PreparedCheckout | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const areaOptions = useMemo(() => getShippingAreas(province), [province]);

  useEffect(() => {
    if (!getAccessToken()) {
      setStep('form');
      return;
    }

    meControllerGetMe()
      .then((user) => {
        setUserId(user.id);
        setProfileName([user.firstName, user.lastName].filter(Boolean).join(' '));
        setProfilePhone(user.phoneNumber ?? '');
      })
      .catch(() => clearAccessToken())
      .finally(() => setStep('form'));
  }, []);

  function invalidateQuote() {
    setPrepared(null);
    setShippingQuote(null);
    setErrorMessage(null);
  }

  async function handleQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !province || !area) {
      setErrorMessage(t('addressRequired'));
      return;
    }

    const form = new FormData(event.currentTarget);
    const address: ShippingAddressInput = {
      recipientName: String(form.get('fullName') ?? '').trim(),
      recipientPhone: String(form.get('phone') ?? '').trim(),
      label: 'Checkout',
      countryCode: 'VN',
      province: province.name,
      district: area.name,
      ward: area.name,
      streetLine1: String(form.get('addressLine') ?? '').trim(),
      note: String(form.get('note') ?? '').trim() || undefined,
      isShipping: true,
      isDefault: true,
    };

    setStep('quoting');
    setErrorMessage(null);
    setPrepared(null);
    try {
      const shipping = await quoteShipping({
        province_code: province.id,
        district_code: area.id,
      });
      setShippingQuote(shipping);
      if (!shipping.serviceable) {
        setErrorMessage(shipping.reason ?? t('unsupportedArea'));
        return;
      }

      const savedAddress = await upsertShippingAddress(userId, address);
      const checkoutDto = {
        shipping_address_id: savedAddress.id,
        province_code: province.id,
        district_code: area.id,
      };
      const quote = await quoteCheckout(checkoutDto, locale);
      setPrepared({
        shippingAddressId: savedAddress.id,
        provinceCode: province.id,
        districtCode: area.id,
        notes: address.note,
        quote,
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('genericError')));
      await cart.refresh();
    } finally {
      setStep('form');
    }
  }

  async function handlePayment() {
    if (!prepared) return;
    setStep('redirecting');
    setErrorMessage(null);
    try {
      const result = await createCheckoutOrder(
        {
          shipping_address_id: prepared.shippingAddressId,
          province_code: prepared.provinceCode,
          district_code: prepared.districtCode,
          notes: prepared.notes,
        },
        locale,
      );
      window.location.assign(result.paymentUrl);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('genericError')));
      setStep('form');
      setPrepared(null);
      await cart.refresh();
    }
  }

  if (step === 'checking-auth' || cart.isLoading) {
    return <div className="bg-ivory py-20 text-center text-muted-foreground">{t('loading')}</div>;
  }

  if (!userId) {
    return (
      <div className="bg-ivory py-16 sm:py-20">
        <div className="mx-auto max-w-lg px-5 text-center sm:px-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="mt-3 text-muted-foreground">{t('signInRequired')}</p>
          <Link href="/login" className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary-dark">{t('signIn')}</Link>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="bg-ivory py-16 sm:py-20">
        <div className="mx-auto flex max-w-lg flex-col items-center px-5 text-center sm:px-8">
          <ShoppingBag className="size-14 text-muted-foreground" strokeWidth={1.25} aria-hidden="true" />
          <h1 className="mt-5 font-display text-3xl font-bold text-foreground">{t('emptyCartTitle')}</h1>
          <Link href="/products" className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary-dark">{t('emptyCartCta')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">{t('title')}</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleQuote} onChange={invalidateQuote} className="space-y-5 rounded-xl bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold">{t('shippingTitle')}</h2>
            </div>
            {errorMessage ? <div className="rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">{errorMessage}</div> : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <CheckoutInput id="fullName" name="fullName" label={t('fullName')} autoComplete="name" defaultValue={profileName} required />
              <CheckoutInput id="phone" name="phone" type="tel" label={t('phone')} autoComplete="tel" defaultValue={profilePhone} required />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <CheckoutSelect id="province" label={t('province')} value={province?.id ?? ''} onChange={(id) => {
                setProvince(provinces.find((item) => item.id === id) ?? null);
                setArea(null);
                invalidateQuote();
              }} placeholder={t('provincePlaceholder')} options={provinces} />
              <CheckoutSelect id="district" label={t('district')} value={area?.id ?? ''} onChange={(id) => {
                setArea(areaOptions.find((item) => item.id === id) ?? null);
                invalidateQuote();
              }} placeholder={t('districtPlaceholder')} options={areaOptions} disabled={!province} />
            </div>
            <CheckoutInput id="addressLine" name="addressLine" label={t('addressLine')} required />
            <CheckoutInput id="note" name="note" label={t('note')} />

            <div className="rounded-lg border-2 border-primary bg-blush px-4 py-4">
              <p className="font-bold text-foreground">{t('vnpayLabel')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('vnpayDescription')}</p>
            </div>

            <button type="submit" disabled={step === 'quoting' || step === 'redirecting'} className="flex h-12 w-full items-center justify-center rounded-lg border-2 border-primary px-6 text-sm font-bold text-primary transition-colors hover:bg-blush disabled:cursor-wait disabled:opacity-60">
              {step === 'quoting' ? t('quoting') : t('checkShipping')}
            </button>

            {shippingQuote ? (
              <div className={`rounded-lg p-4 ${shippingQuote.serviceable ? 'bg-primary/10 text-foreground' : 'bg-destructive/10 text-destructive'}`} aria-live="polite">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-bold">{shippingQuote.fulfillment_type === 'DIRECT' ? t('directDelivery') : t('dealerDelivery')}</p>
                    <p className="mt-1 text-sm">{shippingQuote.serviceable ? fCurrencyVND(shippingQuote.shipping_fee) : shippingQuote.reason}</p>
                    {shippingQuote.dealer ? <p className="mt-1 text-sm">{t('dealerName', { name: shippingQuote.dealer.name })}</p> : null}
                  </div>
                </div>
              </div>
            ) : null}

            <button type="button" onClick={() => void handlePayment()} disabled={!prepared || step === 'redirecting'} className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
              {step === 'redirecting' ? t('redirecting') : t('payWithVnpay')}
            </button>
          </form>

          <aside className="h-fit rounded-xl bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">{t('summaryTitle')}</h2>
            <ul className="mt-5 space-y-3">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                  <span className="font-semibold text-foreground">{fCurrencyVND(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <SummaryRow label={t('subtotal')} value={prepared ? prepared.quote.subtotal : cart.subtotal} />
            {prepared ? <SummaryRow label={t('shippingFee')} value={prepared.quote.shippingFee} /> : null}
            {prepared ? <SummaryRow label={t('total')} value={prepared.quote.total} emphasized /> : null}
          </aside>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: number; emphasized?: boolean }) {
  return (
    <div className={`mt-4 flex items-center justify-between border-t border-border pt-4 ${emphasized ? 'text-lg font-bold' : ''}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasized ? 'text-primary' : 'font-semibold'}>{fCurrencyVND(value)}</span>
    </div>
  );
}

function CheckoutInput({ id, label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-bold text-foreground">{label}</span>
      <input id={id} className={`h-12 w-full rounded-lg border border-border bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 ${className ?? ''}`} {...props} />
    </label>
  );
}

function CheckoutSelect({ id, label, value, onChange, placeholder, options, disabled }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string; options: ShippingAreaOption[]; disabled?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-foreground">{label}</label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled} required>
        <SelectTrigger id={id}><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
