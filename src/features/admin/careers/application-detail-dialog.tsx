'use client';

import { Dialog } from '@/components/admin/ui/dialog';
import { Badge } from '@/components/admin/ui/badge';
import type { AdminApplication } from './api';
import { APPLICATION_STATUS_LABEL } from './status';

const STATUS_TONE = {
  new: 'info',
  reviewing: 'warning',
  hired: 'success',
  rejected: 'danger',
} as const;

interface ApplicationDetailDialogProps {
  application: AdminApplication | null;
  onClose: () => void;
}

/** Xem đầy đủ một đơn ứng tuyển (thư giới thiệu thường dài, không hợp trong bảng). */
export function ApplicationDetailDialog({ application, onClose }: ApplicationDetailDialogProps) {
  return (
    <Dialog
      open={!!application}
      onOpenChange={(open) => !open && onClose()}
      title={application?.full_name ?? ''}
      description={application ? `Ứng tuyển: ${application.career_title}` : undefined}
    >
      {application ? (
        <dl className="flex flex-col gap-4 text-sm">
          <Row label="Trạng thái">
            <Badge tone={STATUS_TONE[application.status]}>{APPLICATION_STATUS_LABEL[application.status]}</Badge>
          </Row>
          <Row label="Email">
            <a href={`mailto:${application.email}`} className="text-primary hover:underline">{application.email}</a>
          </Row>
          <Row label="Điện thoại">
            <a href={`tel:${application.phone}`} className="text-primary hover:underline">{application.phone}</a>
          </Row>
          <Row label="Ngày nộp">{new Date(application.created_at).toLocaleString('vi-VN')}</Row>
          <Row label="CV">
            <a href={application.cv_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Mở hồ sơ
            </a>
          </Row>
          {application.cover_letter ? (
            <div>
              <dt className="mb-1 font-semibold text-muted-foreground">Thư giới thiệu</dt>
              <dd className="whitespace-pre-wrap leading-6 text-foreground">{application.cover_letter}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <dt className="w-28 shrink-0 font-semibold text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-foreground">{children}</dd>
    </div>
  );
}
