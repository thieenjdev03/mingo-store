'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { CircleUserRound, CreditCard, MapPin, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/features/cart/cart-context';
import { getAccessToken, clearAccessToken } from '@/lib/auth/token';
import { meControllerGetMe } from '@/lib/api/generated/me/me';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { fCurrencyVND } from '@/lib/format';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';
import { provinces, type Province } from '@/lib/vn-address';
import { createCheckoutOrder, quoteCheckout, quoteShipping, upsertShippingAddress } from './api';
import { getShippingAreas, type ShippingAreaOption } from './shipping-locations';
import type { CheckoutQuoteView, CheckoutRequestInput, ShippingAddressInput, ShippingQuoteView } from './types';

interface PreparedCheckout {
  request: CheckoutRequestInput;
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
    if (!province || !area) {
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
      const shipping = await quoteShipping({ province_code: province.id, district_code: area.id });
      setShippingQuote(shipping);
      if (!shipping.serviceable) {
        setErrorMessage(shipping.reason ?? t('unsupportedArea'));
        return;
      }

      const shippingAddressId = userId ? (await upsertShippingAddress(userId, address)).id : undefined;
      const request: CheckoutRequestInput = {
        shippingAddressId,
        shippingAddress: userId ? undefined : address,
        provinceCode: province.id,
        districtCode: area.id,
        notes: address.note,
      };
      setPrepared({ request, quote: await quoteCheckout(request, locale) });
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
      const result = await createCheckoutOrder(prepared.request, locale);
      window.location.assign(result.paymentUrl);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('genericError')));
      setStep('form');
      setPrepared(null);
      await cart.refresh();
    }
  }

  if (step === 'checking-auth' || cart.isLoading) {
    return <div className="bg-ivory py-20"><MeltingIceCreamLoader label={t('loading')} /></div>;
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

  const subtotal = prepared?.quote.subtotal ?? cart.subtotal;
  const shippingFee = prepared?.quote.shippingFee ?? null;
  const total = prepared?.quote.total ?? cart.subtotal;
  const busy = step === 'quoting' || step === 'redirecting';

  return (
    <div className="bg-ivory py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">{t('title')}</h1>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-10">
          <div className="space-y-9">
            <section aria-labelledby="loyalty-title">
              <h2 id="loyalty-title" className="text-xl font-bold">{t('loyaltyTitle')}</h2>
              <div className="mt-4 flex items-center gap-3 bg-card px-5 py-4 text-sm font-semibold shadow-sm">
                <CircleUserRound className="size-5 shrink-0" aria-hidden="true" />
                {userId ? (
                  <p>{t('memberCheckout')}</p>
                ) : (
                  <p><Link href="/login" className="font-bold text-primary underline underline-offset-2">{t('signIn')}</Link> {t('guestCheckout')}</p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-center gap-3 border border-primary px-5 py-3 text-center text-sm font-bold text-primary">
                <Truck className="size-5" aria-hidden="true" />
                {t('deliveryNotice')}
              </div>
            </section>

            <form id="checkout-form" onSubmit={handleQuote} onChange={invalidateQuote} className="space-y-9">
              <section aria-labelledby="shipping-title">
                <h2 id="shipping-title" className="text-xl font-bold">{t('shippingTitle')}</h2>
                <div className="mt-4 bg-card p-5 shadow-sm sm:p-6">
                  <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('recipientTitle')}</p>
                  {errorMessage ? <div className="mb-5 rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">{errorMessage}</div> : null}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CheckoutInput id="fullName" name="fullName" label={t('fullName')} autoComplete="name" defaultValue={profileName} required />
                    <CheckoutInput id="phone" name="phone" type="tel" label={t('phone')} autoComplete="tel" defaultValue={profilePhone} pattern="(?:0|\+84)[0-9]{9,10}" required />
                    <CheckoutSelect id="province" label={t('province')} value={province?.id ?? ''} onChange={(id) => {
                      setProvince(provinces.find((item) => item.id === id) ?? null);
                      setArea(null);
                      invalidateQuote();
                    }} placeholder={t('provincePlaceholder')} options={provinces} />
                    <CheckoutSelect id="district" label={t('district')} value={area?.id ?? ''} onChange={(id) => {
                      setArea(areaOptions.find((item) => item.id === id) ?? null);
                      invalidateQuote();
                    }} placeholder={t('districtPlaceholder')} options={areaOptions} disabled={!province} />
                    <CheckoutInput id="addressLine" name="addressLine" label={t('addressLine')} autoComplete="street-address" required className="sm:col-span-2" />
                    <CheckoutInput id="note" name="note" label={t('note')} className="sm:col-span-2" />
                  </div>
                </div>
              </section>

              <section aria-labelledby="delivery-title">
                <h2 id="delivery-title" className="text-xl font-bold">{t('deliveryMethodTitle')}</h2>
                <div className="mt-4 bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3 bg-blush px-4 py-4 font-bold text-primary">
                    <span className="size-4 rounded-full border-4 border-primary bg-card" aria-hidden="true" />
                    {t('standardDelivery')}
                  </div>
                  {shippingQuote ? (
                    <div className={`mt-3 flex items-start gap-3 rounded-lg p-4 text-sm ${shippingQuote.serviceable ? 'bg-primary/10' : 'bg-destructive/10 text-destructive'}`} aria-live="polite">
                      <PackageCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-bold">{shippingQuote.fulfillment_type === 'DIRECT' ? t('directDelivery') : t('dealerDelivery')}</p>
                        <p className="mt-1">{shippingQuote.serviceable ? fCurrencyVND(shippingQuote.shipping_fee) : shippingQuote.reason}</p>
                        {shippingQuote.dealer ? <p className="mt-1">{t('dealerName', { name: shippingQuote.dealer.name })}</p> : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              <section aria-labelledby="payment-title">
                <h2 id="payment-title" className="text-xl font-bold">{t('paymentTitle')}</h2>
                <div className="mt-4 bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3 bg-blush px-4 py-4">
                    <span className="mt-1 size-4 shrink-0 rounded-full border-4 border-primary bg-card" aria-hidden="true" />
                    <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-primary">{t('vnpayLabel')}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t('vnpayDescription')}</p>
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <section className="bg-card p-5 shadow-sm sm:p-6" aria-labelledby="order-items-title">
              <h2 id="order-items-title" className="text-lg font-bold">{t('orderItemsTitle')}</h2>
              <ul className="mt-5 space-y-5">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4">
                    <div className="relative size-20 shrink-0 bg-background">
                      {item.product.image ? <Image src={item.product.image} alt={item.product.name} fill sizes="80px" className="object-contain p-1" /> : <span className="flex h-full items-center justify-center text-2xl">🍦</span>}
                      <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-blush text-xs font-bold text-primary">{item.quantity}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground">{item.product.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t('quantity', { count: item.quantity })}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold">{fCurrencyVND(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-card p-5 shadow-sm sm:p-6" aria-labelledby="summary-title">
              <h2 id="summary-title" className="sr-only">{t('summaryTitle')}</h2>
              <dl className="space-y-3 text-sm">
                <SummaryRow label={t('subtotal')} value={fCurrencyVND(subtotal)} />
                <SummaryRow label={t('shippingFee')} value={shippingFee === null ? t('notCalculated') : fCurrencyVND(shippingFee)} />
                <SummaryRow label={t('discount')} value={fCurrencyVND(Number(prepared?.quote.summary.discount ?? 0))} />
                <SummaryRow label={t('total')} value={fCurrencyVND(total)} emphasized />
              </dl>
              <button
                type={prepared ? 'button' : 'submit'}
                form={prepared ? undefined : 'checkout-form'}
                onClick={prepared ? () => void handlePayment() : undefined}
                disabled={busy || !cart.valid}
                className="mt-5 flex h-12 w-full items-center justify-center bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                {step === 'quoting' ? t('quoting') : step === 'redirecting' ? t('redirecting') : prepared ? t('payWithVnpay') : t('checkShipping')}
              </button>
              <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                {t.rich('termsAgreement', { policy: (chunks) => <Link href="/policies" className="font-semibold text-primary underline underline-offset-2">{chunks}</Link> })}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${emphasized ? 'border-t border-border pt-3 text-base font-bold' : ''}`}>
      <dt>{label}</dt>
      <dd className={emphasized ? 'text-primary' : 'font-semibold'}>{value}</dd>
    </div>
  );
}

function CheckoutInput({ id, label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <label htmlFor={id} className={`block bg-blush px-3 pt-2 ${className ?? ''}`}>
      <span className="block text-xs font-bold text-primary">{label}</span>
      <input id={id} className="h-10 w-full border-0 border-b border-primary bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-0" {...props} />
    </label>
  );
}

function CheckoutSelect({ id, label, value, onChange, placeholder, options, disabled }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string; options: ShippingAreaOption[]; disabled?: boolean }) {
  return (
    <div className="bg-blush px-3 pt-2">
      <label htmlFor={id} className="block text-xs font-bold text-primary">{label}</label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled} required>
        <SelectTrigger id={id} className="h-10 rounded-none border-0 border-b border-primary bg-transparent px-0 shadow-none focus:ring-0"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
