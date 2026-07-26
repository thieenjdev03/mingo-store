'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Button } from '@/components/admin/ui/button';
import { Badge } from '@/components/admin/ui/badge';
import { useToast } from '@/components/admin/ui/toast';
import { getOrder, updateOrder, changeOrderStatus } from './api';
import { ORDER_STATUS_LABEL, orderStatusTone, nextOrderStatuses, type OrderStatus } from './status';

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
      className="max-w-2xl"
    >
      {isLoading || !order ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Đang tải…</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge tone={orderStatusTone(order.status)}>{ORDER_STATUS_LABEL[order.status] ?? order.status}</Badge>
            <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
            {order.paymentMethod ? <span className="text-muted-foreground">• {order.paymentMethod}</span> : null}
          </div>

          {order.user ? (
            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="font-semibold">{order.user.firstName || order.user.email || order.user.id}</p>
              {order.user.email ? <p className="text-muted-foreground">{order.user.email}</p> : null}
              {order.user.phoneNumber ? <p className="text-muted-foreground">{order.user.phoneNumber}</p> : null}
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
                      <td className="px-3 py-2 text-right">{it.unitPrice}</td>
                      <td className="px-3 py-2 text-right">{it.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {order.summary ? (
              <div className="mt-2 flex flex-col items-end gap-0.5 text-sm">
                <span className="text-muted-foreground">Tạm tính: {order.summary.subtotal} {order.summary.currency}</span>
                <span className="text-muted-foreground">Vận chuyển: {order.summary.shipping} {order.summary.currency}</span>
                <span className="font-bold">Tổng: {order.summary.total} {order.summary.currency}</span>
              </div>
            ) : null}
          </div>

          {/* Status change */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-sm font-semibold">Cập nhật trạng thái</p>
            <div className="flex flex-wrap items-end gap-2">
              <NativeSelect value={toStatus} onChange={(e) => setToStatus(e.target.value)} className="max-w-[200px]">
                <option value="">— Chọn trạng thái —</option>
                {nextOrderStatuses(order.status).map((s) => (
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
