'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Dialog } from '@/components/admin/ui/dialog';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Button } from '@/components/admin/ui/button';
import { Badge } from '@/components/admin/ui/badge';
import { useToast } from '@/components/admin/ui/toast';
import { fCurrencyVND } from '@/lib/format';
import {
  getOrder,
  updateOrder,
  changeOrderStatus,
  formatOrderAddress,
  isRedundantOrderNote,
  PAYMENT_STATUS_LABEL,
  paymentStatusTone,
} from './api';
import { ORDER_STATUS_LABEL, orderStatusTone, selectableOrderStatuses, type OrderStatus } from './status';

const money = (value: string | number | undefined) => fCurrencyVND(Number(value ?? 0));

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  onChanged: () => void;
}

export function OrderDetailDialog({ open, onOpenChange, orderId, onChanged }: Props) {
  const { toast } = useToast();
  const { data: order, isLoading, mutate } = useSWR(open && orderId ? ['/orders', orderId] : null, () => getOrder(orderId!));

  const [toStatus, setToStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (order) {
      setToStatus('');
      setStatusNote('');
      setTracking(order.trackingNumber ?? '');
      setCarrier(order.carrier ?? '');
      setInternalNotes(order.internalNotes ?? '');
    }
  }, [order]);

  const applyStatus = async () => {
    if (!order || !toStatus) return;
    setBusy(true);
    try {
      await changeOrderStatus(order.id, { toStatus: toStatus as OrderStatus, note: statusNote || undefined });
      toast({ title: 'Đã cập nhật trạng thái', tone: 'success' });
      await mutate();
      onChanged();
    } catch {
      toast({ title: 'Cập nhật trạng thái thất bại', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!order) return;
    setBusy(true);
    try {
      await updateOrder(order.id, {
        trackingNumber: tracking || undefined,
        carrier: carrier || undefined,
        internalNotes: internalNotes || undefined,
      });
      toast({ title: 'Đã lưu thông tin đơn', tone: 'success' });
      await mutate();
      onChanged();
    } catch {
      toast({ title: 'Lưu thất bại', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={order ? `Đơn ${order.orderNumber}` : 'Chi tiết đơn hàng'}
      className="max-w-3xl"
    >
      {isLoading || !order ? (
        <div className="py-5"><MeltingIceCreamLoader size="sm" /></div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Hai trạng thái tách bạch: đơn và thanh toán. Gộp chung là nguồn nhầm lẫn lớn nhất. */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge tone={orderStatusTone(order.status)}>{ORDER_STATUS_LABEL[order.status] ?? order.status}</Badge>
            {order.paymentStatus ? (
              <Badge tone={paymentStatusTone(order.paymentStatus)}>
                {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                {order.paymentMethod ? ` · ${order.paymentMethod}` : ''}
              </Badge>
            ) : null}
            <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
          </div>

          {order.status === 'PENDING_PAYMENT' && order.stockReserved === false ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Đơn chờ thanh toán nhưng <strong>chưa giữ tồn kho</strong> — hàng có thể bị bán cho đơn khác.
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Giao tới — thông tin quan trọng nhất để xử lý đơn, trước đây không hiển thị. */}
            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Giao tới</p>
              {order.shippingAddress ? (
                <>
                  <p className="font-semibold">{order.shippingAddress.recipientName || '—'}</p>
                  {order.shippingAddress.recipientPhone ? (
                    <a href={`tel:${order.shippingAddress.recipientPhone}`} className="text-primary hover:underline">
                      {order.shippingAddress.recipientPhone}
                    </a>
                  ) : null}
                  <p className="mt-1 text-muted-foreground">{formatOrderAddress(order.shippingAddress) || '—'}</p>
                  {order.shippingAddress.note ? (
                    <p className="mt-1 text-muted-foreground">Ghi chú: {order.shippingAddress.note}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground">Chưa có địa chỉ giao hàng.</p>
              )}
            </div>

            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tài khoản đặt</p>
              {order.user ? (
                <>
                  <p className="font-semibold">
                    {[order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || order.user.email}
                  </p>
                  {order.user.email ? <p className="text-muted-foreground">{order.user.email}</p> : null}
                  {order.user.phoneNumber ? <p className="text-muted-foreground">{order.user.phoneNumber}</p> : null}
                </>
              ) : (
                <p className="text-muted-foreground">Khách vãng lai.</p>
              )}
              {order.paidAt ? (
                <p className="mt-2 text-muted-foreground">
                  Thanh toán lúc {new Date(order.paidAt).toLocaleString('vi-VN')}
                </p>
              ) : null}
              {order.vnpayTransactionNo || order.vnpayTxnRef ? (
                <p className="text-muted-foreground">Mã GD: {order.vnpayTransactionNo || order.vnpayTxnRef}</p>
              ) : null}
            </div>
          </div>

          {/* notes của checkout hay bị nhồi lại chính địa chỉ -> chỉ hiện khi là ghi chú thật. */}
          {order.notes && !isRedundantOrderNote(order.notes) ? (
            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ghi chú của khách</p>
              <p className="whitespace-pre-line">{order.notes}</p>
            </div>
          ) : null}

          {/* Items */}
          <div>
            <p className="mb-2 text-sm font-semibold">Sản phẩm</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                    <th className="px-3 py-2">Tên</th>
                    <th className="px-3 py-2 text-center">SL</th>
                    <th className="px-3 py-2 text-right">Đơn giá</th>
                    <th className="px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((it, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">{it.productName}{it.variantName ? ` — ${it.variantName}` : ''}</td>
                      <td className="px-3 py-2 text-center">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">{money(it.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium">{money(it.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {order.summary ? (
              <dl className="mt-3 ml-auto grid w-full max-w-xs grid-cols-2 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Tạm tính</dt>
                <dd className="text-right">{money(order.summary.subtotal)}</dd>
                <dt className="text-muted-foreground">Vận chuyển</dt>
                <dd className="text-right">{money(order.summary.shipping)}</dd>
                {Number(order.summary.discount) > 0 ? (
                  <>
                    <dt className="text-muted-foreground">Giảm giá</dt>
                    <dd className="text-right text-green-700">−{money(order.summary.discount)}</dd>
                  </>
                ) : null}
                {Number(order.summary.tax) > 0 ? (
                  <>
                    <dt className="text-muted-foreground">Thuế</dt>
                    <dd className="text-right">{money(order.summary.tax)}</dd>
                  </>
                ) : null}
                <dt className="mt-1 border-t border-border pt-1 font-bold">Tổng</dt>
                <dd className="mt-1 border-t border-border pt-1 text-right font-bold">{money(order.summary.total)}</dd>
              </dl>
            ) : null}
          </div>

          {/* Lịch sử trạng thái — cột "kiểm tra đơn" quan trọng nhất, trước đây bỏ trống. */}
          {order.tracking_history && order.tracking_history.length > 0 ? (
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 text-sm font-semibold">Lịch sử trạng thái</p>
              <ol className="flex flex-col gap-2 text-sm">
                {order.tracking_history.map((entry, index) => {
                  const at = entry.changedAt || entry.at;
                  return (
                    <li key={index} className="flex flex-wrap items-center gap-2 border-l-2 border-border pl-3">
                      <Badge tone={orderStatusTone((entry.to_status ?? '') as OrderStatus)}>
                        {ORDER_STATUS_LABEL[(entry.to_status ?? '') as OrderStatus] ?? entry.to_status}
                      </Badge>
                      {at ? <span className="text-muted-foreground">{new Date(at).toLocaleString('vi-VN')}</span> : null}
                      {entry.note ? <span className="text-muted-foreground">— {entry.note}</span> : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          {/* Status change */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-sm font-semibold">Cập nhật trạng thái</p>
            <div className="flex flex-wrap items-end gap-2">
              <NativeSelect fitContent value={toStatus} onChange={(e) => setToStatus(e.target.value)}>
                <option value="">— Chọn trạng thái —</option>
                {selectableOrderStatuses(order.status).map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                ))}
              </NativeSelect>
              <Input placeholder="Ghi chú (tuỳ chọn)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className="max-w-[220px]" />
              <Button onClick={applyStatus} disabled={busy || !toStatus}>Áp dụng</Button>
            </div>
          </div>

          {/* Edit tracking / notes */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-3 text-sm font-semibold">Vận chuyển & ghi chú nội bộ</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="tracking" label="Mã vận đơn" required={false}>
                <Input id="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} />
              </Field>
              <Field id="carrier" label="Đơn vị vận chuyển" required={false}>
                <Input id="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
              </Field>
            </div>
            <Field id="internal" label="Ghi chú nội bộ" required={false} className="mt-3">
              <Textarea id="internal" rows={2} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
            </Field>
            <div className="mt-3 flex justify-end">
              <Button variant="outline" onClick={saveEdit} disabled={busy}>Lưu thông tin</Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
