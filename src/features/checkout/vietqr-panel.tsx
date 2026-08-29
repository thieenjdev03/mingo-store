'use client';

import { useTranslations } from 'next-intl';
import { fCurrencyVND } from '@/lib/format';
import { buildVietQrImageUrl, VIETQR_NOT_CONFIGURED } from '@/config/vietqr';

/**
 * Khối QR chuyển khoản VietQR. Dùng chung cho bước thanh toán ngay sau khi đặt đơn
 * và cho trang chi tiết đơn (thanh toán lại khi khách lỡ luồng QR) — QR chỉ phụ thuộc
 * mã đơn + số tiền nên dựng lại bất cứ lúc nào cũng hợp lệ.
 */
export function VietQrPanel({ orderCode, total }: { orderCode: string; total: number }) {
  const t = useTranslations('checkout');
  const qrImageUrl = !VIETQR_NOT_CONFIGURED ? buildVietQrImageUrl(total, orderCode) : null;

  return (
    <>
      <dl className="mt-6 grid grid-cols-2 gap-px bg-border text-sm">
        <div className="bg-blush px-4 py-3">
          <dt className="text-xs font-semibold text-muted-foreground">{t('orderNumberLabel')}</dt>
          <dd className="mt-1 font-bold text-foreground">{orderCode}</dd>
        </div>
        <div className="bg-blush px-4 py-3 text-right">
          <dt className="text-xs font-semibold text-muted-foreground">{t('amountToPay')}</dt>
          <dd className="mt-1 text-base font-bold text-primary">{fCurrencyVND(total)}</dd>
        </div>
      </dl>

      <div className="mt-6 border border-primary/30 bg-ivory p-5 text-center sm:p-7">
        {qrImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrImageUrl}
            alt={t('qrAlt')}
            width={320}
            height={320}
            className="mx-auto h-auto w-full max-w-[320px] bg-card"
          />
        ) : (
          <div className="mx-auto flex min-h-56 max-w-[320px] items-center justify-center bg-card px-6 text-sm leading-6 text-muted-foreground">
            {t('vietqrNotConfigured')}
          </div>
        )}
        <p className="mt-5 text-sm font-semibold leading-6 text-foreground">{t('transferContentNote', { orderNumber: orderCode })}</p>
      </div>

      <p className="mt-5 border-l-2 border-primary bg-primary/[0.04] px-4 py-3 text-sm leading-6 text-muted-foreground">{t('manualVerificationNote')}</p>
    </>
  );
}
