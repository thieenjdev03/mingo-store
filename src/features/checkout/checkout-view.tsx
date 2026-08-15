'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Banknote, CheckCircle2, CircleUserRound, PackageCheck, QrCode, ReceiptText, ShoppingBag, Truck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/features/cart/cart-context';
import { notifyCartUpdated } from '@/features/cart/cart-token';
import { getAccessToken, clearAccessToken } from '@/lib/auth/token';
import { meControllerGetMe } from '@/lib/api/generated/me/me';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { fCurrencyVND } from '@/lib/format';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';
import { provinces, type Province } from '@/lib/vn-address';
import { createCheckoutOrder, quoteCheckout, quoteShipping, upsertShippingAddress } from './api';
import { getShippingAreas, type ShippingAreaOption } from './shipping-locations';
import type { CheckoutPaymentMethod, CheckoutQuoteView, CheckoutRequestInput, ShippingAddressInput, ShippingQuoteView } from './types';

interface PreparedCheckout {
  request: CheckoutRequestInput;
  quote: CheckoutQuoteView;
}

type Step = 'checking-auth' | 'form' | 'quoting' | 'redirecting' | 'completed';

export function CheckoutView() {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const cart = useCart();
  const [step, setStep] = useState<Step>('checking-auth');
  const [userId, setUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('VIETQR');
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  const [completedOrderCode, setCompletedOrderCode] = useState<string | null>(null);
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
        setProfileEmail(user.email);
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
    const customerNote = String(form.get('note') ?? '').trim() || undefined;
    const invoiceEmail = String(form.get('invoiceEmail') ?? '').trim();
    const address: ShippingAddressInput = {
      recipientName: String(form.get('fullName') ?? '').trim(),
      recipientPhone: String(form.get('phone') ?? '').trim(),
      label: 'Checkout',
      countryCode: 'VN',
      province: province.name,
      district: area.name,
      ward: area.name,
      streetLine1: String(form.get('addressLine') ?? '').trim(),
      note: customerNote,
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
        notes: buildOrderNotes(customerNote, paymentMethod, invoiceRequested, invoiceEmail),
        paymentMethod,
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
      if (prepared.request.paymentMethod === 'COD') {
        setCompletedOrderCode(result.orderCode);
        setStep('completed');
        notifyCartUpdated();
        return;
      }
      if (!result.paymentUrl) {
        setErrorMessage(t('qrUnavailable'));
        setStep('form');
        setPrepared(null);
        await cart.refresh();
        return;
      }
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

  if (step === 'completed' && completedOrderCode) {
    return (
      <div className="bg-ivory py-16 sm:py-24">
        <section className="mx-auto max-w-lg px-5 text-center sm:px-8">
          <CheckCircle2 className="mx-auto size-16 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="mt-5 font-display text-3xl font-bold text-foreground">{t('codSuccessTitle')}</h1>
          <p className="mt-3 leading-7 text-muted-foreground">{t('codSuccessDescription', { orderCode: completedOrderCode })}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {userId ? <Link href={`/orders/${completedOrderCode}`} className="inline-flex h-11 items-center justify-center border-2 border-primary px-6 text-sm font-bold text-primary">{t('viewOrder')}</Link> : null}
            <Link href="/products" className="inline-flex h-11 items-center justify-center bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary-dark">{t('continueShopping')}</Link>
          </div>
        </section>
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

  const subtotal = prepared?.quote.subtotal ?? cart.subtotal;
  const shippingFee = prepared?.quote.shippingFee ?? null;
  const total = prepared?.quote.total ?? cart.subtotal;
  const busy = step === 'quoting' || step === 'redirecting';

  return (
    <div className="min-h-screen bg-ivory py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-6 xl:gap-8">
          <div className="min-w-0 space-y-10 sm:space-y-12">
            <h1 className="font-display text-4xl font-bold leading-none text-foreground sm:text-5xl">{t('title')}</h1>

            <section aria-labelledby="loyalty-title">
              <h2 id="loyalty-title" className="text-xl font-bold text-foreground">{t('loyaltyTitle')}</h2>
              <div className="mt-5 flex min-h-12 items-center gap-3 bg-card px-4 py-3 text-sm font-semibold sm:px-5">
                <CircleUserRound className="size-5 shrink-0" aria-hidden="true" />
                {userId ? (
                  <p>{t('memberCheckout')}</p>
                ) : (
                  <p><Link href="/login" className="font-bold text-primary underline underline-offset-2">{t('signIn')}</Link> {t('guestCheckout')}</p>
                )}
              </div>
              <div className="mt-3 flex min-h-12 items-center justify-center gap-3 border border-primary bg-primary/[0.03] px-5 py-3 text-center text-sm font-bold text-primary">
                <Truck className="size-5" aria-hidden="true" />
                {t('deliveryNotice')}
              </div>
            </section>

            <form id="checkout-form" onSubmit={handleQuote} onChange={invalidateQuote} className="space-y-10 sm:space-y-12">
              <section aria-labelledby="shipping-title">
                <h2 id="shipping-title" className="text-xl font-bold text-foreground">{t('shippingTitle')}</h2>
                <div className="mt-5 bg-card p-4 sm:p-5">
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t('recipientTitle')}</p>
                  {errorMessage ? <div className="mb-5 rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">{errorMessage}</div> : null}
                  <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
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
                <h2 id="delivery-title" className="text-xl font-bold text-foreground">{t('deliveryMethodTitle')}</h2>
                <div className="mt-5 bg-card p-4">
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t('deliveryMethodTitle')}</p>
                  <div className="flex min-h-14 items-center gap-3 border-b border-primary/60 bg-blush px-4 py-3 text-sm font-bold text-primary">
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

              <section aria-labelledby="invoice-title">
                <h2 id="invoice-title" className="text-xl font-bold text-foreground">{t('invoiceTitle')}</h2>
                <div className="mt-5 bg-card p-4">
                  <label className="flex min-h-14 cursor-pointer items-center gap-3 px-1 text-sm font-bold text-primary">
                    <input
                      type="checkbox"
                      checked={invoiceRequested}
                      onChange={(event) => setInvoiceRequested(event.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="relative h-6 w-11 shrink-0 rounded-full border border-primary bg-card transition-colors peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:size-[18px] after:rounded-full after:bg-primary after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-card" aria-hidden="true" />
                    <ReceiptText className="size-5" aria-hidden="true" />
                    {t('invoiceRequest')}
                  </label>
                  {invoiceRequested ? (
                    <div className="mt-3 border-t border-border pt-4">
                      <CheckoutInput
                        id="invoiceEmail"
                        name="invoiceEmail"
                        type="email"
                        label={t('invoiceEmail')}
                        defaultValue={profileEmail}
                        placeholder={t('invoiceEmailPlaceholder')}
                        autoComplete="email"
                        required
                      />
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{t('invoiceNote')}</p>
                    </div>
                  ) : null}
                </div>
              </section>

              <section aria-labelledby="payment-title">
                <h2 id="payment-title" className="text-xl font-bold text-foreground">{t('paymentTitle')}</h2>
                <div className="mt-5 bg-card p-4">
                  <label className={`flex min-h-16 cursor-pointer items-start gap-3 border-b border-primary/60 px-4 py-4 transition-colors ${paymentMethod === 'COD' ? 'bg-blush' : 'hover:bg-blush/55'}`}>
                    <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="peer sr-only" />
                    <span className={`mt-1 size-5 shrink-0 rounded-full border border-primary ${paymentMethod === 'COD' ? 'border-[5px] bg-card' : 'bg-card'}`} aria-hidden="true" />
                    <Banknote className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-primary">{t('codLabel')}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t('codDescription')}</p>
                    </div>
                  </label>
                  <label className={`flex min-h-16 cursor-pointer items-start gap-3 border-b border-primary/60 px-4 py-4 transition-colors ${paymentMethod === 'VIETQR' ? 'bg-blush' : 'hover:bg-blush/55'}`}>
                    <input type="radio" name="paymentMethod" value="VIETQR" checked={paymentMethod === 'VIETQR'} onChange={() => setPaymentMethod('VIETQR')} className="peer sr-only" />
                    <span className={`mt-1 size-5 shrink-0 rounded-full border border-primary ${paymentMethod === 'VIETQR' ? 'border-[5px] bg-card' : 'bg-card'}`} aria-hidden="true" />
                    <QrCode className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-primary">{t('vietqrLabel')}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t('vietqrDescription')}</p>
                    </div>
                  </label>
                </div>
              </section>
            </form>
          </div>

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-28">
            <section className="bg-card p-4 sm:p-5 lg:min-h-[510px]" aria-labelledby="order-items-title">
              <h2 id="order-items-title" className="text-base font-bold text-foreground">{t('orderItemsTitle')}</h2>
              <ul className="mt-6 space-y-6">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4">
                    <div className="relative h-24 w-16 shrink-0">
                      {item.product.image ? <Image src={item.product.image} alt={item.product.name} fill sizes="80px" className="object-contain p-1" /> : <span className="flex h-full items-center justify-center text-2xl">🍦</span>}
                      <span className="absolute -right-2 top-0 flex size-6 items-center justify-center rounded-full bg-blush text-xs font-bold text-primary">{item.quantity}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-bold leading-5 text-foreground">{item.product.name}</p>
                      <p className="mt-1 text-xs uppercase text-muted-foreground">{item.variantName ?? t('quantity', { count: item.quantity })}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">{fCurrencyVND(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-card p-4 sm:p-5 lg:py-10" aria-labelledby="summary-title">
              <h2 id="summary-title" className="sr-only">{t('summaryTitle')}</h2>
              <dl className="space-y-2 text-sm text-primary">
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
                className="mt-4 flex h-12 w-full items-center justify-center bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                {step === 'quoting'
                  ? t('quoting')
                  : step === 'redirecting'
                    ? t(paymentMethod === 'COD' ? 'placingCodOrder' : 'redirectingToQr')
                    : prepared
                      ? t(paymentMethod === 'COD' ? 'placeCodOrder' : 'payWithQr')
                      : t('checkShipping')}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                {t.rich('termsAgreement', { policy: (chunks) => <Link href="/policies" className="font-semibold text-primary underline underline-offset-2">{chunks}</Link> })}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function buildOrderNotes(
  customerNote: string | undefined,
  paymentMethod: CheckoutPaymentMethod,
  invoiceRequested: boolean,
  invoiceEmail: string,
): string {
  return [
    customerNote,
    `Phương thức thanh toán: ${paymentMethod}`,
    `Yêu cầu xuất hóa đơn điện tử: ${invoiceRequested ? 'Có' : 'Không'}`,
    invoiceRequested && invoiceEmail ? `Email nhận hóa đơn: ${invoiceEmail}` : undefined,
  ].filter((line): line is string => Boolean(line)).join('\n');
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${emphasized ? 'pt-1 text-base font-bold' : ''}`}>
      <dt>{label}</dt>
      <dd className={emphasized ? 'font-bold text-primary' : 'font-semibold'}>{value}</dd>
    </div>
  );
}

function CheckoutInput({ id, label, className, required, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <label htmlFor={id} className={`block bg-blush px-3 pt-2 ${className ?? ''}`}>
      <span className="block text-xs font-bold text-primary">{label}{required ? ' *' : ''}</span>
      <input id={id} required={required} className="h-10 w-full border-0 border-b border-primary bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-0" {...props} />
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
