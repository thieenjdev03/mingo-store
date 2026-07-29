'use client';

import useSWR from 'swr';
import { Dialog } from '@/components/admin/ui/dialog';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { useToast } from '@/components/admin/ui/toast';
import type { CareerApplicationDto, CareerApplicationDtoStatus, CareerDto } from '@/lib/api/generated/ecomAPI.schemas';
import { applicationsKey, listApplications, updateApplicationStatus } from './api';
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL } from './status';

interface CareerApplicationsDialogProps {
  career: CareerDto | null;
  onOpenChange: (open: boolean) => void;
}

/** Danh sách ứng viên đã nộp đơn cho một tin tuyển dụng (admin). */
export function CareerApplicationsDialog({ career, onOpenChange }: CareerApplicationsDialogProps) {
  const { toast } = useToast();
  const { data, isLoading, error, mutate } = useSWR(
    career ? applicationsKey(career.id) : null,
    () => listApplications(career!.id),
  );
  const rows = data ?? [];

  const onStatusChange = async (app: CareerApplicationDto, status: CareerApplicationDtoStatus) => {
    try {
      await updateApplicationStatus(app.id, { status });
      toast({ title: 'Đã cập nhật trạng thái', tone: 'success' });
      mutate();
    } catch {
      toast({ title: 'Cập nhật thất bại', tone: 'error' });
    }
  };

  return (
    <Dialog
      open={!!career}
      onOpenChange={(open) => !open && onOpenChange(false)}
      title="Ứng viên"
      description={career ? `Đơn ứng tuyển cho "${career.title}"` : undefined}
      className="max-w-3xl"
    >
      {isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : null}
      {error ? <p className="text-sm text-destructive">Không tải được danh sách.</p> : null}
      {!isLoading && !error && rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có ứng viên nào.</p>
      ) : null}

      <ul className="flex flex-col divide-y divide-border">
        {rows.map((app) => (
          <li key={app.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{app.full_name}</p>
              <p className="text-sm text-muted-foreground">{app.email} · {app.phone}</p>
              {app.cover_letter ? <p className="mt-2 text-sm text-foreground/80">{app.cover_letter}</p> : null}
              <a href={app.cv_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
                Xem CV
              </a>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(app.created_at).toLocaleString('vi-VN')}</p>
            </div>
            <NativeSelect
              value={app.status}
              onChange={(e) => onStatusChange(app, e.target.value as CareerApplicationDtoStatus)}
              className="w-full sm:w-40"
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>
              ))}
            </NativeSelect>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
