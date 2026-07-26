'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Eye } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Badge } from '@/components/admin/ui/badge';
import { OrderDetailDialog } from '@/features/admin/orders/order-detail-dialog';
import { ordersKey, listOrders, type AdminOrder } from '@/features/admin/orders/api';
import { ORDER_STATUS_LABEL, orderStatusTone } from '@/features/admin/orders/status';

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const params = { status: status || undefined };
  const { data, isLoading, error, mutate } = useSWR(ordersKey(params), () => listOrders(params));
  const rows = data ?? [];

  const [detailId, setDetailId] = useState<string | null>(null);

  const columns: Column<AdminOrder>[] = [
    { key: 'orderNumber', header: 'Mã đơn', render: (o) => <span className="font-semibold">{o.orderNumber}</span> },
    {
      key: 'customer',
      header: 'Khách hàng',
      render: (o) => o.user?.email || o.user?.firstName || <span className="text-muted-foreground">—</span>,
    },
    { key: 'createdAt', header: 'Ngày tạo', render: (o) => new Date(o.createdAt).toLocaleDateString('vi-VN') },
    {
      key: 'total',
      header: 'Tổng',
      align: 'right',
      render: (o) => (o.summary ? `${o.summary.total} ${o.summary.currency}` : '—'),
    },
    { key: 'paymentMethod', header: 'Thanh toán', align: 'center', render: (o) => o.paymentMethod || '—' },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (o) => <Badge tone={orderStatusTone(o.status)}>{ORDER_STATUS_LABEL[o.status] ?? o.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (o) => (
        <Button variant="ghost" size="icon" aria-label="Xem" onClick={() => setDetailId(o.id)}>
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Đơn hàng" description="Xem đơn, cập nhật trạng thái và thông tin vận chuyển." />

      <div className="mb-4">
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[220px]">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(o) => o.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách đơn hàng (cần quyền admin).' : null}
        emptyMessage="Chưa có đơn hàng nào."
      />

      <OrderDetailDialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)} orderId={detailId} onChanged={() => mutate()} />
    </div>
  );
}
