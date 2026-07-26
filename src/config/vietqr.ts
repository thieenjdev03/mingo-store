/**
 * VietQR — QR chuyển khoản ngân hàng, xác nhận thanh toán thủ công (không có webhook ngân hàng).
 * Ảnh QR render qua img.vietqr.io (dịch vụ công khai, không cần API key) — chỉ cần build URL.
 * THÔNG TIN TÀI KHOẢN đọc từ .env — placeholder mặc định "REPLACE_ME" cho tới khi điền thật.
 */
export const VIETQR_CONFIG = {
  bankId: process.env.NEXT_PUBLIC_VIETQR_BANK_ID ?? 'REPLACE_ME',
  accountNo: process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO ?? 'REPLACE_ME',
  accountName: process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME ?? 'REPLACE_ME',
} as const;

export const VIETQR_NOT_CONFIGURED = Object.values(VIETQR_CONFIG).some((v) => v === 'REPLACE_ME');

/** amount tính bằng VND (số nguyên, không thập phân). */
export function buildVietQrImageUrl(amount: number, orderNumber: string): string {
  const params = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: orderNumber,
    accountName: VIETQR_CONFIG.accountName,
  });
  return `https://img.vietqr.io/image/${VIETQR_CONFIG.bankId}-${VIETQR_CONFIG.accountNo}-compact2.png?${params.toString()}`;
}
