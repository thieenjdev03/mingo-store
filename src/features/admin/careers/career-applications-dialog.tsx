'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Trash2 } from 'lucide-react';
import { Dialog } from '@/components/admin/ui/dialog';
import { MeltingIceCreamLoader } from '@/components/ui/melting-ice-cream-loader';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Button } from '@/components/admin/ui/button';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import type { CareerApplicationDto, CareerApplicationDtoStatus, CareerDto } from '@/lib/api/generated/ecomAPI.schemas';
import { applicationsKey, listApplications, updateApplicationStatus, deleteApplication } from './api';
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

  const [deleting, setDeleting] = useState<CareerApplicationDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const onStatusChange = async (app: CareerApplicationDto, status: CareerApplicationDtoStatus) => {
    try {
      await updateApplicationStatus(app.id, { status });
      toast({ title: 'Đã cập nhật trạng thái', tone: 'success' });
      mutate();
    } catch {
      toast({ title: 'Cập nhật thất bại', tone: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteApplication(deleting.id);
      toast({ title: 'Đã xoá đơn ứng tuyển', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
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
      {isLoading ? <MeltingIceCreamLoader size="sm" /> : null}
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
            <div className="flex items-center gap-2">
              <NativeSelect
                value={app.status}
                onChange={(e) => onStatusChange(app, e.target.value as CareerApplicationDtoStatus)}
                className="w-full sm:w-40"
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>
                ))}
              </NativeSelect>
              <Button variant="ghost" size="icon" aria-label="Xoá" onClick={() => setDeleting(app)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá đơn ứng tuyển?"
        description={deleting ? `Xoá đơn của "${deleting.full_name}". Hành động này không thể hoàn tác.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </Dialog>
  );
}
