export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0\u00A0\u20AB'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',  
  }).format(value)
}

/** Format số có dấu chấm ngăn cách hàng nghìn, ví dụ 1000 thành "1.000" */
export function formatNumberInput(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return new Intl.NumberFormat('vi-VN').format(Math.trunc(value))
}

/** Parse chuỗi đã format về số, ví dụ "1.000" thành 1000 */
export function parseNumberInput(raw: string): number | undefined {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return undefined
  const n = Number(digits)
  return Number.isNaN(n) ? undefined : n
}
