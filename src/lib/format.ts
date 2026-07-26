/** "100.000Đ" — theo mockup PDP. Dùng cho MỌI chỗ hiển thị giá. */
export function fCurrencyVND(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)}Đ`;
}

/** Khối lượng (backend lưu theo kg): <1kg -> gram, còn lại kg (bỏ số 0 thừa). */
export function fWeight(kg: number): string {
  if (kg < 1) return `${Math.round(kg * 1000)} g`;
  return `${Number(kg.toFixed(2))} kg`;
}
