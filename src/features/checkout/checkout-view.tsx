'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Banknote, CheckCircle2, CircleUserRound, QrCode, ReceiptText, ShoppingBag, Truck } from 'lucide-react';
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
import { SHIPPING_CONFIG } from '@/config/shipping';
import { VietQrPanel } from './vietqr-panel';
import { createCheckoutOrder, getShippingAddresses } from './api';
import { getShippingAreas, type ShippingAreaOption } from './shipping-locations';
import type { CheckoutPaymentMethod, CheckoutRequestInput, SavedShippingAddress, ShippingAddressInput } from './types';

type Step = 'checking-auth' | 'form' | 'submitting' | 'redirecting' | 'vietqr-payment' | 'completed';

interface VietQrPaymentOrder {
  orderCode: string;
  total: number;
}

export function CheckoutView() {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const cart = useCart();
  const [step, setStep] = useState<Step>('checking-auth');
  const [userId, setUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<SavedShippingAddress[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('');
  const [recipientMatchesBuyer, setRecipientMatchesBuyer] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('VIETQR');
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  const [completedOrderCode, setCompletedOrderCode] = useState<string | null>(null);
  const [vietQrPaymentOrder, setVietQrPaymentOrder] = useState<VietQrPaymentOrder | null>(null);
  const [province, setProvince] = useState<Province | null>(null);
  const [area, setArea] = useState<ShippingAreaOption | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const areaOptions = useMemo(() => getShippingAreas(province), [province]);

  useEffect(() => {
    if (!getAccessToken()) {
      setRecipientMatchesBuyer(false);
      setStep('form');
      return;
    }
    meControllerGetMe()
      .then(async (user) => {
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
        setUserId(user.id);
        setProfileName(name);
        setProfilePhone(user.phoneNumber ?? '');
        setProfileEmail(user.email);
        setRecipientName(name);
        setRecipientPhone(user.phoneNumber ?? '');

        const addresses = await getShippingAddresses(user.id).catch(() => []);
        const shippingAddresses = addresses.filter((address) => address.isShipping);
        setSavedAddresses(shippingAddresses);
        const defaultAddress = shippingAddresses.find((address) => address.isDefault) ?? shippingAddresses[0];
        if (defaultAddress) applySavedAddress(defaultAddress);
      })
      .catch(() => clearAccessToken())
      .finally(() => setStep('form'));
  }, []);

  function applySavedAddress(address: SavedShippingAddress) {
    const nextProvince = provinces.find((item) => item.id === address.provinceId || item.name === address.province) ?? null;
    const nextArea = getShippingAreas(nextProvince).find((item) =>
      item.id === address.wardId || item.name === address.district || item.name === address.ward,
    ) ?? null;

    setSelectedSavedAddressId(address.id);
    setRecipientMatchesBuyer(
      address.recipientName.trim() === profileName.trim()
      && (address.recipientPhone ?? '').trim() === profilePhone.trim(),
    );
    setRecipientName(address.recipientName);
    setRecipientPhone(address.recipientPhone ?? '');
    setAddressLine(address.streetLine1);
    setProvince(nextProvince);
    setArea(nextArea);
    clearCheckoutError();
  }

  function setRecipientSameAsBuyer(checked: boolean) {
    setRecipientMatchesBuyer(checked);
    if (checked) {
      setRecipientName(profileName);
      setRecipientPhone(profilePhone);
    }
    clearCheckoutError();
  }

  function clearCheckoutError() {
    setErrorMessage(null);
  }

  /** Validate phía client trước khi gọi API. Trả message lỗi (đã i18n) hoặc null nếu hợp lệ. */
  function validateCheckout(form: FormData): string | null {
    const fullName = String(form.get('recipientName') ?? '').trim();
    const phone = String(form.get('recipientPhone') ?? '').trim();
    const addressLine = String(form.get('addressLine') ?? '').trim();
    const invoiceEmail = String(form.get('invoiceEmail') ?? '').trim();
    const guestEmailValue = String(form.get('guestEmail') ?? '').trim();
    if (!fullName) return t('nameRequired');
    if (!/^(?:0|\+84)\d{9,10}$/.test(phone)) return t('phoneInvalid');
    if (!province || !area) return t('addressRequired');
    if (!addressLine) return t('addressLineRequired');
    if (invoiceRequested && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoiceEmail)) return t('invoiceEmailInvalid');
    // Optional — only validated when the guest actually typed something.
    if (!userId && guestEmailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmailValue)) return t('guestEmailInvalid');
    return null;
  }

  // Flow 1 click: validate -> lưu địa chỉ -> tạo đơn -> hiển thị bước thanh toán tương ứng.
  // Phí ship lấy từ config dùng chung nên không gọi /shipping/quote.
  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const validationError = validateCheckout(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    if (!province || !area) return; // validateCheckout đã chặn; dòng này để TS narrow type.

    const customerNote = String(form.get('note') ?? '').trim() || undefined;
    const invoiceEmail = String(form.get('invoiceEmail') ?? '').trim();
    const guestEmailValue = String(form.get('guestEmail') ?? '').trim() || undefined;
    const address: ShippingAddressInput = {
      recipientName: String(form.get('recipientName') ?? '').trim(),
      recipientPhone: String(form.get('recipientPhone') ?? '').trim(),
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

    setStep('submitting');
    setErrorMessage(null);
    try {
      // Gửi thẳng địa chỉ trong payload tạo đơn, kể cả khi đã đăng nhập: backend nhận
      // shipping_address cho user có auth và bỏ qua lookup địa chỉ đã lưu, nên không cần
      // lưu địa chỉ trước rồi mới đặt hàng (bớt một round-trip có thể làm hỏng cả checkout).
      const request: CheckoutRequestInput = {
        shippingAddress: address,
        email: userId ? undefined : guestEmailValue,
        provinceCode: province.id,
        districtCode: area.id,
        notes: buildOrderNotes(customerNote, paymentMethod, invoiceRequested, invoiceEmail),
        paymentMethod,
      };
      // Bỏ qua /checkout/quote — tạo đơn thẳng. Backend tự validate tồn kho/giá ở create-order.
      setStep('redirecting');
      const result = await createCheckoutOrder(request, locale);
      if (paymentMethod === 'COD') {
        setCompletedOrderCode(result.orderCode);
        setStep('completed');
        notifyCartUpdated();
        return;
      }
      const backendTotal = Number(result.summary.total);
      setVietQrPaymentOrder({
        orderCode: result.orderCode,
        total: Number.isFinite(backendTotal) ? backendTotal : 0,
      });
      setStep('vietqr-payment');
      notifyCartUpdated();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('genericError')));
      setStep('form');
      await cart.refresh();
    }
  }

  if (step === 'checking-auth' || cart.isLoading) {
    return <div className="bg-ivory py-20"><MeltingIceCreamLoader label={t('loading')} /></div>;
  }

  if (step === 'completed' && completedOrderCode) {
    return (
      <div className="min-h-screen bg-ivory py-16 sm:py-24">
        <section className="mx-auto max-w-xl px-5 sm:px-8">
          <div className="bg-card p-5 shadow-sm sm:p-8">
            <div className="flex items-start gap-4 border-b border-border pb-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-7" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-primary">{t('codPendingBadge')}</p>
                <h1 className="mt-1 font-display text-3xl font-bold text-foreground">{t('codSuccessTitle')}</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('codSuccessDescription', { orderCode: completedOrderCode })}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {userId ? <Link href={`/orders/${completedOrderCode}`} className="inline-flex h-11 items-center justify-center border-2 border-primary px-6 text-sm font-bold text-primary">{t('viewOrder')}</Link> : null}
              <Link href="/products" className="inline-flex h-11 items-center justify-center bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">{t('continueShopping')}</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (step === 'vietqr-payment' && vietQrPaymentOrder) {
    return (
      <div className="min-h-screen bg-ivory py-16 sm:py-24">
        <section className="mx-auto max-w-xl px-5 sm:px-8">
          <div className="bg-card p-5 shadow-sm sm:p-8">
            <div className="flex items-start gap-4 border-b border-border pb-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-7" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-primary">{t('orderRecorded')}</p>
                <h1 className="mt-1 font-display text-3xl font-bold text-foreground">{t('qrPaymentTitle')}</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('qrPaymentDescription', { orderNumber: vietQrPaymentOrder.orderCode })}</p>
              </div>
            </div>

            <VietQrPanel orderCode={vietQrPaymentOrder.orderCode} total={vietQrPaymentOrder.total} />

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {userId ? <Link href={`/orders/${vietQrPaymentOrder.orderCode}`} className="inline-flex h-11 items-center justify-center border-2 border-primary px-6 text-sm font-bold text-primary">{t('viewOrder')}</Link> : null}
              <Link href="/products" className="inline-flex h-11 items-center justify-center bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark">{t('continueShopping')}</Link>
            </div>
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

  const subtotal = cart.subtotal;
  const productDiscount = 0; // Không còn /checkout/quote — giảm giá SP do backend áp lúc tạo đơn.
  const shippingFee = SHIPPING_CONFIG.feeVnd;
  const voucherDiscount = 0; // Chưa có tính năng voucher — hiển thị 0đ theo design.
  const total = subtotal - productDiscount - voucherDiscount + shippingFee;
  const busy = step === 'submitting' || step === 'redirecting';

  return (
    <div className="min-h-screen bg-ivory py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)] lg:gap-6 xl:gap-8">
          <div className="min-w-0 space-y-10 sm:space-y-12">
            <h1 className="font-display text-4xl font-bold leading-none text-foreground sm:text-5xl">{t('title')}</h1>

            <section aria-labelledby="loyalty-title">
              <h2 id="loyalty-title" className="text-xl font-bold text-foreground">{t('loyaltyTitle')}</h2>
              {userId ? (
                <></>
              ) : (
                <div className="mt-5 flex min-h-12 items-center gap-3 bg-card px-4 py-3 text-sm font-semibold sm:px-5">
                  <CircleUserRound className="size-5 shrink-0" aria-hidden="true" />

                  <p><Link href="/login" className="font-bold text-primary underline underline-offset-2">{t('signIn')}</Link> {t('guestCheckout')}</p>
                </div>
              )}
              <div className="mt-3 flex min-h-12 items-center justify-center gap-3 border border-primary bg-primary/[0.03] px-5 py-3 text-center text-sm text-primary">
                <Truck className="size-5" aria-hidden="true" />
                {t('deliveryNotice')}
              </div>
            </section>

            <form id="checkout-form" onSubmit={handleCheckout} onChange={clearCheckoutError} className="space-y-10 sm:space-y-12">
              {userId ? (
                <section aria-labelledby="buyer-title">
                  <h2 id="buyer-title" className="text-xl font-bold uppercase tracking-wide text-foreground">{t('buyerTitle')}</h2>
                  <div className="mt-5 bg-card p-4 sm:p-5">
                    {errorMessage ? <div className="mb-5 rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">{errorMessage}</div> : null}
                    <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                      <CheckoutInput id="buyerName" label={t('fullName')} autoComplete="name" value={profileName} readOnly />
                      <CheckoutInput id="buyerPhone" type="tel" label={t('phone')} autoComplete="tel" value={profilePhone} readOnly />
                    </div>
                  </div>
                </section>
              ) : null}

              <section aria-labelledby="shipping-title">
                <h2 id="shipping-title" className="text-xl font-bold uppercase tracking-wide text-foreground">{t('shippingTitle')}</h2>
                <div className="mt-5 bg-card p-4 sm:p-5">
                  {userId && savedAddresses.length > 0 ? (
                    <div className="mb-5 border-b border-border pb-5">
                      <label htmlFor="savedAddress" className="block text-xs font-bold text-primary">{t('savedAddress')}</label>
                      <Select value={selectedSavedAddressId || undefined} onValueChange={(id) => {
                        const address = savedAddresses.find((item) => item.id === id);
                        if (address) applySavedAddress(address);
                      }}>
                        <SelectTrigger id="savedAddress" className="mt-2 h-11 rounded-none border-0 border-b border-primary bg-blush px-3 shadow-none focus:ring-0"><SelectValue placeholder={t('savedAddressPlaceholder')} /></SelectTrigger>
                        <SelectContent>
                          {savedAddresses.map((address) => <SelectItem key={address.id} value={address.id}>{address.isDefault ? `${t('defaultAddress')} — ` : ''}{address.label}: {address.streetLine1}, {address.ward ?? address.district}, {address.province}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}

                  {userId ? (
                    <label className="mb-5 flex min-h-12 cursor-pointer items-center gap-3 text-sm font-bold uppercase tracking-wide text-foreground">
                      <input type="checkbox" checked={recipientMatchesBuyer} onChange={(event) => setRecipientSameAsBuyer(event.target.checked)} className="peer sr-only" />
                      <span className="relative h-7 w-14 shrink-0 rounded-full border-2 border-primary bg-card transition-colors peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-primary after:transition-transform peer-checked:after:translate-x-7 peer-checked:after:bg-card" aria-hidden="true" />
                      {t('recipientSameAsBuyer')}
                    </label>
                  ) : null}
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t('recipientTitle')}</p>
                  <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                    <CheckoutInput id="recipientName" name="recipientName" label={t('fullName')} autoComplete="name" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} readOnly={recipientMatchesBuyer} required />
                    <CheckoutInput id="recipientPhone" name="recipientPhone" type="tel" label={t('phone')} autoComplete="tel" value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} readOnly={recipientMatchesBuyer} pattern="(?:0|\+84)[0-9]{9,10}" required />
                    {!userId ? (
                      <CheckoutInput
                        id="guestEmail"
                        name="guestEmail"
                        type="email"
                        label={t('guestEmailLabel')}
                        placeholder={t('guestEmailPlaceholder')}
                        autoComplete="email"
                        value={guestEmail}
                        onChange={(event) => setGuestEmail(event.target.value)}
                        className="sm:col-span-2"
                      />
                    ) : null}
                    <CheckoutSelect id="province" label={t('province')} value={province?.id ?? ''} onChange={(id) => {
                      setProvince(provinces.find((item) => item.id === id) ?? null);
                      setArea(null);
                      clearCheckoutError();
                    }} placeholder={t('provincePlaceholder')} options={provinces} />
                    <CheckoutSelect id="district" label={t('district')} value={area?.id ?? ''} onChange={(id) => {
                      setArea(areaOptions.find((item) => item.id === id) ?? null);
                      clearCheckoutError();
                    }} placeholder={t('districtPlaceholder')} options={areaOptions} disabled={!province} />
                    <CheckoutInput id="addressLine" name="addressLine" label={t('addressLine')} autoComplete="street-address" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} required className="sm:col-span-2" />
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
                  <div className="mt-3 flex items-center justify-between gap-3 bg-primary/10 px-4 py-3 text-sm text-primary" aria-live="polite">
                    <span className="font-semibold">{t('shippingFee')}</span>
                    <span className="font-bold">{fCurrencyVND(SHIPPING_CONFIG.feeVnd)}</span>
                  </div>
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
                      {item.variantName ? <p className="mt-1 text-xs font-semibold uppercase text-foreground/70">{item.variantName}</p> : null}
                      <p className="mt-1 text-xs uppercase text-muted-foreground">{t('quantity', { count: item.quantity })}</p>
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
                <SummaryRow label={t('discount')} value={fCurrencyVND(productDiscount)} />
                <SummaryRow label={t('shippingFee')} value={fCurrencyVND(shippingFee)} />
                <SummaryRow label={t('voucherDiscount')} value={fCurrencyVND(voucherDiscount)} />
                <SummaryRow label={t('total')} value={fCurrencyVND(total)} emphasized />
              </dl>
              <button
                type="submit"
                form="checkout-form"
                disabled={busy || !cart.valid}
                className="mt-4 flex h-12 w-full items-center justify-center bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                {step === 'submitting'
                  ? t('submitting')
                  : step === 'redirecting'
                    ? t(paymentMethod === 'COD' ? 'placingCodOrder' : 'redirectingToQr')
                    : t(paymentMethod === 'COD' ? 'placeCodOrder' : 'payWithQr')}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                {t.rich('termsAgreement', {
                  privacy: (chunks) => (
                    <Link
                      href="/policies?policy=chinh-sach-bao-mat-thong-tin"
                      className="font-semibold text-primary underline decoration-primary/50 underline-offset-2 transition-colors hover:text-primary-dark focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {chunks}
                    </Link>
                  ),
                  terms: (chunks) => (
                    <Link
                      href="/policies?policy=dieu-khoan-su-dung"
                      className="font-semibold text-primary underline decoration-primary/50 underline-offset-2 transition-colors hover:text-primary-dark focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
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

function CheckoutInput({ id, label, className, required, disabled, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <label htmlFor={id} className={`block px-3 pt-2 ${disabled ? 'bg-muted/60' : 'bg-blush'} ${className ?? ''}`}>
      <span className={`block text-xs font-bold ${disabled ? 'text-muted-foreground' : 'text-primary'}`}>{label}{required ? ' *' : ''}</span>
      <input
        id={id}
        required={required}
        disabled={disabled}
        className={`h-10 w-full border-0 border-b bg-transparent text-base outline-none focus:ring-0 ${disabled ? 'cursor-not-allowed border-muted-foreground/30 text-muted-foreground placeholder:text-muted-foreground/60' : 'border-primary text-foreground placeholder:text-muted-foreground'}`}
        {...props}
      />
    </label>
  );
}

function CheckoutSelect({ id, label, value, onChange, placeholder, options, disabled }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string; options: ShippingAreaOption[]; disabled?: boolean }) {
  return (
    <div className={`px-3 pt-2 ${disabled ? 'bg-muted/60' : 'bg-blush'}`}>
      <label htmlFor={id} className={`block text-xs font-bold ${disabled ? 'text-muted-foreground' : 'text-primary'}`}>{label}</label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled} required>
        <SelectTrigger id={id} className={`h-10 rounded-none border-0 border-b bg-transparent px-0 shadow-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-100 ${disabled ? 'border-muted-foreground/30 text-muted-foreground' : 'border-primary'}`}><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
