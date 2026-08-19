/**
 * TẦNG 2 — view model của điểm loyalty.
 * Component (tầng 3) chỉ nhận các type ở đây, KHÔNG đụng DTO generated trực tiếp.
 * DTO generated (tầng 1): src/lib/api/generated/ecomAPI.schemas.ts.
 */
import type {
  PointsBalanceResponseDto,
  PointsHistoryResponseDto,
  PointTransactionDto,
} from '@/lib/api/generated/ecomAPI.schemas';
import { PointTransactionDtoType } from '@/lib/api/generated/ecomAPI.schemas';

export interface PointsBalanceView {
  /** Điểm hiển thị = pointsBalance backend trả về (đã là điểm cuối, không chia thêm). */
  balance: number;
}

export interface PointTransactionView {
  id: string;
  orderId: string;
  type: PointTransactionDtoType;
  isEarn: boolean;
  /** Magnitude luôn dương từ backend. */
  points: number;
  /** Điểm có dấu để hiển thị (+7 / -7). */
  signedPoints: number;
  createdAt: string;
}

export interface PointsHistoryView {
  items: PointTransactionView[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toPointsBalanceView(dto: PointsBalanceResponseDto): PointsBalanceView {
  return { balance: dto.pointsBalance ?? 0 };
}

export function toPointTransactionView(dto: PointTransactionDto): PointTransactionView {
  const isEarn = dto.type === PointTransactionDtoType.EARN;
  return {
    id: dto.id,
    orderId: dto.orderId,
    type: dto.type,
    isEarn,
    points: dto.points,
    signedPoints: isEarn ? dto.points : -dto.points,
    createdAt: dto.createdAt,
  };
}

export function toPointsHistoryView(dto: PointsHistoryResponseDto): PointsHistoryView {
  const limit = dto.limit || 20;
  return {
    items: (dto.items ?? []).map(toPointTransactionView),
    total: dto.total ?? 0,
    page: dto.page ?? 1,
    limit,
    totalPages: Math.max(1, Math.ceil((dto.total ?? 0) / limit)),
  };
}
