export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0\u00A0\u20AB'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',  
  }).format(value)
}

export function formatNumberInput(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return new Intl.NumberFormat('vi-VN').format(Math.trunc(value))
}

export function parseNumberInput(raw: string): number | undefined {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return undefined
  const n = Number(digits)
  return Number.isNaN(n) ? undefined : n
}
