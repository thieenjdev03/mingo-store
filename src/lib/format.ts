/** "100.000Đ" — theo mockup PDP. Dùng cho MỌI chỗ hiển thị giá. */
export function fCurrencyVND(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)}Đ`;
}
