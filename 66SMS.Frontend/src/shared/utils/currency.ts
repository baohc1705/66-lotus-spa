// Tiện ích format số tiền theo chuẩn Việt Nam (VND).
// Ví dụ: formatCurrency(150000) → "150.000 ₫"
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0\u00A0\u20AB'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}
