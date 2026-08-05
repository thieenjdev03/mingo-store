import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  error?: string | null;
  /** Số dòng hiển thị đồng thời trước khi bảng tự cuộn. */
  visibleRows?: number;
}

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;
const TABLE_HEADER_HEIGHT = 45;
const TABLE_ROW_HEIGHT = 65;

/**
 * Bảng danh sách admin dùng chung.
 * Header bám trên cùng, còn dữ liệu cuộn nội bộ để không kéo dài toàn bộ trang CRUD.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyMessage = 'Không có dữ liệu.',
  error,
  visibleRows = 10,
}: DataTableProps<T>) {
  const tableMaxHeight = TABLE_HEADER_HEIGHT + Math.max(1, visibleRows) * TABLE_ROW_HEIGHT;

  return (
    <div
      className="overflow-auto overscroll-contain rounded border border-border bg-white [scrollbar-gutter:stable]"
      style={{ maxHeight: tableMaxHeight }}
    >
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'sticky top-0 z-10 h-11 border-b border-border bg-muted px-4 py-3 font-semibold text-muted-foreground',
                  alignClass[col.align ?? 'left'],
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-destructive">
                {error}
              </td>
            </tr>
          ) : loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                <MeltingIceCreamLoader size="sm" />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="h-16 hover:bg-muted/30">
                {columns.map((col) => (
                  <td key={col.key} className={cn('border-b border-border px-4 py-3 text-foreground', alignClass[col.align ?? 'left'], col.className)}>
                    {col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
