import type { CareerApplicationDtoStatus } from '@/lib/api/generated/ecomAPI.schemas';

/** Nhãn tiếng Việt cho trạng thái đơn ứng tuyển — dùng chung cho mọi màn hình admin. */
export const APPLICATION_STATUSES: CareerApplicationDtoStatus[] = ['new', 'reviewing', 'hired', 'rejected'];

export const APPLICATION_STATUS_LABEL: Record<CareerApplicationDtoStatus, string> = {
  new: 'Mới',
  reviewing: 'Đang xem xét',
  hired: 'Đã tuyển',
  rejected: 'Từ chối',
};
