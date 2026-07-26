'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fCurrencyVND } from '@/lib/format';
import { useCart } from '@/features/cart/cart-context';
import { getAccessToken, clearAccessToken } from '@/lib/auth/token';
import { meControllerGetMe } from '@/lib/api/generated/me/me';
import { ordersControllerCreate } from '@/lib/api/generated/orders/orders';
import { ApiError } from '@/lib/api/fetcher';
import { buildVietQrImageUrl, VIETQR_NOT_CONFIGURED } from '@/config/vietqr';
import { provinces, getWardsByProvince, type Province, type Ward } from '@/lib/vn-address';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrderCreateResult {
  id: string;
  orderNumber: string;
  summary: { total: string; currency: string };
}

type Step = 'checking-auth' | 'form' | 'submitting' | 'done';

export function CheckoutView() {
  const t = useTranslations('checkout');
  const { items, subtotal, clear } = useCart();

  const [step, setStep] = useState<Step>('checking-auth');
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderCreateResult | null>(null);
  const [province, setProvince] = useState<Province | null>(null);
  const [ward, setWard] = useState<Ward | null>(null);

  const wardOptions = useMemo(() => (province ? getWardsByProvince(province.id) : []), [province]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setStep('form'); // hiển thị prompt đăng nhập bên dưới, không redirect cứng
      return;
    }
    meControllerGetMe()
      .then((user) => {
        setUserId(user.id);
        setStep('form');
      })
      .catch(() => {
        // Token hết hạn/không hợp lệ — quay về trạng thái chưa đăng nhập.
        clearAccessToken();
        setStep('form');
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return;
    if (!province || !ward) {
      setErrorMessage(t('addressRequired'));
      return;
    }
    setErrorMessage(null);
    setStep('submitting');

    const data = new FormData(event.currentTarget);
    const total = subtotal;

    try {
      const result = (await ordersControllerCreate({
        userId,
        paymentMethod: 'VIETQR',
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          productSlug: item.slug,
          variantName: item.variantLabel ?? undefined,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.price.toFixed(2),
          totalPrice: (item.price * item.quantity).toFixed(2),
        })),
        summary: {
          subtotal: subtotal.toFixed(2),
          shipping: '0.00',
          tax: '0.00',
          discount: '0.00',
          total: total.toFixed(2),
          currency: 'VND',
        },
        shipping_address: {
          full_name: String(data.get('fullName') ?? ''),
          phone: String(data.get('phone') ?? ''),
          countryCode: 'VN',
          province: province.name,
          // Việt Nam bỏ cấp quận/huyện từ 01/07/2025 (xem vietnam-address-data) —
          // backend vẫn yêu cầu "district" bắt buộc, nên dùng lại tên phường/xã
          // (đơn vị hành chính chi tiết nhất hiện có) thay vì bịa dữ liệu.
          district: ward.name,
          ward: ward.name,
          address_line: String(data.get('addressLine') ?? ''),
          note: String(data.get('note') ?? '') || undefined,
        },
      })) as unknown as OrderCreateResult;

      clear();
      setOrder(result);
      setStep('done');
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? errorMessageFromApiError(error) : t('genericError'));
      setStep('form');
    }
  }

  if (step === 'checking-auth') {
    return <div className="bg-ivory py-20 text-center text-muted-foreground">{t('title')}…</div>;
  }

  if (!getAccessToken()) {
    return (
      <div className="bg-ivory py-16 sm:py-20">
        <div className="mx-auto max-w-lg px-5 text-center sm:px-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="mt-3 text-muted-foreground">{t('signInRequired')}</p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="bg-ivory py-16 sm:py-20">
        <div className="mx-auto flex max-w-lg flex-col items-center px-5 text-center sm:px-8">
          <ShoppingBag className="size-14 text-muted-foreground" strokeWidth={1.25} aria-hidden="true" />
          <h1 className="mt-5 font-display text-3xl font-bold text-foreground">{t('emptyCartTitle')}</h1>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            {t('emptyCartCta')}
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'done' && order) {
    const total = Number(order.summary.total);
    return (
      <div className="bg-ivory py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-lg px-5 text-center sm:px-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('successTitle')}</h1>
          <p className="mt-2 text-muted-foreground">{t('orderNumberLabel')}: <span className="font-bold text-foreground">{order.orderNumber}</span></p>

          <div className="mt-6 rounded-xl bg-card p-6 shadow-sm">
            {VIETQR_NOT_CONFIGURED ? (
              <p className="rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive">{t('vietqrNotConfigured')}</p>
            ) : (
              <>
                <div className="relative mx-auto aspect-square w-full max-w-[280px]">
                  <Image
                    src={buildVietQrImageUrl(total, order.orderNumber)}
                    alt={t('qrAlt')}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <p className="mt-4 text-2xl font-bold text-primary">{fCurrencyVND(total)}</p>
              </>
            )}
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{t('transferContentNote', { orderNumber: order.orderNumber })}</p>
          </div>

          <div className="mt-6 rounded-lg bg-blush p-4 text-sm leading-6 text-primary">{t('manualVerificationNote')}</div>

          <Link
            href="/account"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            {t('viewAccount')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">{t('title')}</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold">{t('shippingTitle')}</h2>
            {errorMessage ? (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">
                {errorMessage}
              </div>
            ) : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <CheckoutInput id="fullName" name="fullName" label={t('fullName')} autoComplete="name" required />
              <CheckoutInput id="phone" name="phone" type="tel" label={t('phone')} autoComplete="tel" required />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <CheckoutSelect
                id="province"
                label={t('province')}
                required
                value={province?.id ?? ''}
                onChange={(id) => {
                  setProvince(provinces.find((p) => p.id === id) ?? null);
                  setWard(null);
                }}
                placeholder={t('provincePlaceholder')}
                options={provinces.map((p) => ({ value: p.id, label: p.name }))}
              />
              <CheckoutSelect
                id="ward"
                label={t('ward')}
                required
                value={ward?.id ?? ''}
                onChange={(id) => setWard(wardOptions.find((w) => w.id === id) ?? null)}
                placeholder={t('wardPlaceholder')}
                disabled={!province}
                options={wardOptions.map((w) => ({ value: w.id, label: w.name }))}
              />
            </div>
            <CheckoutInput id="addressLine" name="addressLine" label={t('addressLine')} required />
            <CheckoutInput id="note" name="note" label={t('note')} />

            <div>
              <h2 className="text-lg font-bold">{t('paymentTitle')}</h2>
              <div className="mt-3 flex items-center gap-3 rounded-lg border-2 border-primary bg-blush px-4 py-3">
                <input type="radio" checked readOnly className="size-4 accent-[var(--color-primary)]" />
                <span className="font-bold text-foreground">{t('vietqrLabel')}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t('vietqrDescription')}</p>
            </div>

            <button
              type="submit"
              disabled={step === 'submitting' || !userId}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
            >
              {step === 'submitting' ? t('submitting') : t('placeOrder')}
            </button>
          </form>

          <aside className="h-fit rounded-xl bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">{t('summaryTitle')}</h2>
            <ul className="mt-5 space-y-3">
              {items.map((item) => (
                <li key={item.sku} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-foreground">{fCurrencyVND(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
              <span className="text-muted-foreground">{t('subtotal')}</span>
              <span className="text-xl font-bold text-primary">{fCurrencyVND(subtotal)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function errorMessageFromApiError(error: ApiError): string {
  const body = error.body as { message?: string | string[] } | null;
  if (!body?.message) return 'Something went wrong';
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

interface CheckoutInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

function CheckoutInput({ id, label, className, ...props }: CheckoutInputProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-bold text-foreground">{label}</span>
      <input
        id={id}
        className={`h-12 w-full rounded-lg border border-border bg-background px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-primary/15 ${className ?? ''}`}
        {...props}
      />
    </label>
  );
}

interface CheckoutSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  required?: boolean;
}

/** Dùng chung nguồn dữ liệu tỉnh/phường với store-locator (@/lib/vn-address) — xem cascading select ở đó. */
function CheckoutSelect({ id, label, value, onChange, placeholder, options, disabled, required }: CheckoutSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-foreground">
        {label}
      </label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled} required={required}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
