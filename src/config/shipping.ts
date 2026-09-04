/**
 * Cấu hình phí vận chuyển dùng chung cho storefront.
 *
 * Phí hiện tại là cố định và mặc định miễn phí. Giữ cấu hình ở một nơi để
 * checkout và các UI liên quan không bị lệ thuộc vào biến môi trường public.
 */
export const SHIPPING_CONFIG = {
  feeVnd: 0,
} as const;
