'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Eye, PackageCheck, TriangleAlert } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Badge } from '@/components/admin/ui/badge';
import { Pagination } from '@/components/admin/ui/pagination';
import { fCurrencyVND } from '@/lib/format';
import { OrderDetailDialog } from '@/features/admin/orders/order-detail-dialog';
import {
  ordersKey,
  listOrders,
  PAYMENT_STATUS_LABEL,
  paymentStatusTone,
  type AdminOrder,
} from '@/features/admin/orders/api';
import { ORDER_STATUS_LABEL, orderStatusTone } from '@/features/admin/orders/status';

const PER_PAGE = 10;

/** Ngày + giờ: đơn trong cùng một ngày rất nhiều, chỉ ngày thì không phân biệt được. */
function formatDateTime(value: string): { date: string; time: string } {
  const d = new Date(value);
  return {
    date: d.toLocaleDateString('vi-VN'),
    time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const params = { status: status || undefined };
  const { data, isLoading, error, mutate } = useSWR(ordersKey(params), () => listOrders(params));

  const [detailId, setDetailId] = useState<string | null>(null);

  // Lọc thanh toán + tìm kiếm ở client: backend chỉ nhận `status`/`userId`.
  // ponytail: phân trang cũng ở client vì cùng lý do — GET /orders trả toàn bộ đơn.
  // Làm server-side pagination trước khi có server-side search sẽ khiến ô tìm kiếm
  // chỉ tìm trong trang hiện tại. Nâng cấp: thêm page/limit/search/paymentStatus vào
  // orders.controller findAll rồi chuyển cả cụm này xuống API cùng lúc.
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((o) => {
      if (paymentStatus && (o.paymentStatus ?? '') !== paymentStatus) return false;
      if (!q) return true;
      return [
        o.orderNumber,
        o.shippingAddress?.recipientName,
        o.shippingAddress?.recipientPhone,
        o.user?.email,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [data, paymentStatus, search]);

  // Kẹp trang: dữ liệu refetch/lọc lại có thể làm tổng số trang co xuống dưới `page`
  // đang giữ -> nếu không kẹp thì slice ra mảng rỗng và bảng trắng dù vẫn có kết quả.
  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const columns: Column<AdminOrder>[] = [
    {
      key: 'orderNumber',
      header: 'Đơn hàng',
      render: (o) => {
        const { date, time } = formatDateTime(o.createdAt);
        return (
          <div className="min-w-0">
            <p className="font-semibold">{o.orderNumber}</p>
            <p className="text-xs text-muted-foreground">
              {date} · {time}
            </p>
          </div>
        );
      },
    },
    {
      key: 'recipient',
      header: 'Người nhận',
      render: (o) => {
        // Người nhận (từ địa chỉ giao) mới là thứ cần để giao hàng — email tài khoản
        // có thể là người khác đặt hộ, nên đẩy xuống dòng phụ.
        const name = o.shippingAddress?.recipientName || o.user?.firstName || o.user?.email;
        const phone = o.shippingAddress?.recipientPhone || o.user?.phoneNumber;
        if (!name) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            {phone ? <p className="text-xs text-muted-foreground">{phone}</p> : null}
          </div>
        );
      },
    },
    {
      key: 'items',
      header: 'Sản phẩm',
      render: (o) => {
        const items = o.items ?? [];
        if (items.length === 0) return <span className="text-muted-foreground">—</span>;
        const totalQty = items.reduce((sum, it) => sum + (it.quantity ?? 0), 0);
        const [first] = items;
        return (
          <div className="min-w-0">
            <p className="truncate">{first?.productName}</p>
            <p className="text-xs text-muted-foreground">
              {items.length > 1 ? `+${items.length - 1} sản phẩm khác · ` : ''}
              {totalQty} món
            </p>
          </div>
        );
      },
    },
    {
      key: 'total',
      header: 'Tổng tiền',
      align: 'right',
      render: (o) => (o.summary ? <span className="font-semibold">{fCurrencyVND(Number(o.summary.total))}</span> : '—'),
    },
    {
      key: 'payment',
      header: 'Thanh toán',
      align: 'center',
      render: (o) => (
        <div className="flex flex-col items-center gap-1">
          <Badge tone={paymentStatusTone(o.paymentStatus)}>
            {o.paymentStatus ? PAYMENT_STATUS_LABEL[o.paymentStatus] : '—'}
          </Badge>
          {o.paymentMethod ? <span className="text-xs text-muted-foreground">{o.paymentMethod}</span> : null}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái đơn',
      align: 'center',
      render: (o) => (
        <div className="flex flex-col items-center gap-1">
          <Badge tone={orderStatusTone(o.status)}>{ORDER_STATUS_LABEL[o.status] ?? o.status}</Badge>
          {/* Đơn chờ thanh toán mà chưa giữ tồn kho -> có thể bán mất hàng, cảnh báo sớm. */}
          {o.status === 'PENDING_PAYMENT' && o.stockReserved === false ? (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600" title="Chưa giữ tồn kho cho đơn này">
              <TriangleAlert className="size-3" /> chưa giữ hàng
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (o) => (
        <Button variant="ghost" size="icon" aria-label="Xem chi tiết" onClick={() => setDetailId(o.id)}>
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];

  // Tổng quan nhanh trên tập đang hiển thị.
  const stats = useMemo(() => {
    const awaitingPayment = rows.filter((o) => o.paymentStatus === 'PENDING').length;
    const revenue = rows
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + Number(o.summary?.total ?? 0), 0);
    return { count: rows.length, awaitingPayment, revenue };
  }, [rows]);

  return (
    <div>
      <PageHeader title="Đơn hàng" description="Xem đơn, cập nhật trạng thái và thông tin vận chuyển." />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Đơn khớp bộ lọc" value={String(stats.count)} />
        <StatCard label="Chờ thanh toán" value={String(stats.awaitingPayment)} tone="warning" />
        <StatCard label="Doanh thu đã thu" value={fCurrencyVND(stats.revenue)} tone="success" icon />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Tìm mã đơn, tên hoặc SĐT người nhận…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <NativeSelect fitContent value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái đơn</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </NativeSelect>
        <NativeSelect fitContent value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}>
          <option value="">Tất cả thanh toán</option>
          {Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(o) => o.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách đơn hàng (cần quyền admin).' : null}
        emptyMessage={search || status || paymentStatus ? 'Không có đơn nào khớp bộ lọc.' : 'Chưa có đơn hàng nào.'}
      />
      <Pagination page={safePage} totalPages={totalPages} total={rows.length} onPageChange={setPage} />

      <OrderDetailDialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)} orderId={detailId} onChanged={() => mutate()} />
    </div>
  );
}

function StatCard({ label, value, tone, icon }: { label: string; value: string; tone?: 'warning' | 'success'; icon?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={
          tone === 'warning'
            ? 'mt-1 flex items-center gap-2 text-xl font-bold text-amber-600'
            : tone === 'success'
              ? 'mt-1 flex items-center gap-2 text-xl font-bold text-green-700'
              : 'mt-1 flex items-center gap-2 text-xl font-bold text-foreground'
        }
      >
        {icon ? <PackageCheck className="size-5" /> : null}
        {value}
      </p>
    </div>
  );
}
