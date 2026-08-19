/**
 * Chương trình tặng kem: cấu hình lúc build/deploy để vận hành không cần sửa UI.
 * Chỉ dùng NEXT_PUBLIC_ vì đây là thông tin hiển thị công khai cho khách hàng.
 */
function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const isEnabled = process.env.NEXT_PUBLIC_FREE_ICE_CREAM_REWARD_ENABLED !== 'false';
const configuredPoints = positiveInteger(process.env.NEXT_PUBLIC_FREE_ICE_CREAM_REWARD_POINTS, 1_500);

export const FREE_ICE_CREAM_REWARD = {
  isEnabled,
  /** Khi chương trình kết thúc, không còn ngưỡng mà khách có thể đạt được. */
  targetPoints: isEnabled ? configuredPoints : Number.POSITIVE_INFINITY,
} as const;
