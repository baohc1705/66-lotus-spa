import { Badge } from '@/shared/components/ui/badge'

interface Props {
  status?: number
  expiryDate?: string
}

export function CertificateStatusBadge({ status }: Props) {
  if (status === 9 || status === undefined) return null

  const statusLabels: Record<number, { label: string; className: string }> = {
    0: { label: 'Chờ xác minh', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    1: { label: 'Hiệu lực', className: 'bg-green-100 text-green-700 border-green-200' },
    2: { label: 'Hết hạn', className: 'bg-red-100 text-red-700 border-red-200' },
    3: { label: 'Đã thu hồi', className: 'bg-stone-100 text-stone-500 border-stone-200' },
  }

  const config = statusLabels[status] ?? { label: 'Không rõ', className: 'bg-stone-100 text-stone-500' }

  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${config.className}`}>
      {config.label}
    </Badge>
  )
}

export function ExpiryBadge({ expiryDate }: { expiryDate?: string }) {
  if (!expiryDate) {
    return (
      <span className="text-[12px] text-stone-400">Không hết hạn</span>
    )
  }

  const expiry = new Date(expiryDate)
  const today = new Date()
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return <span className="text-[12px] font-medium text-red-600">{expiryDate.slice(0, 10)} (Hết hạn)</span>
  }
  if (diffDays <= 30) {
    return <span className="text-[12px] font-medium text-yellow-600">{expiryDate.slice(0, 10)} (còn {diffDays} ngày)</span>
  }
  return <span className="text-[12px] text-stone-600">{expiryDate.slice(0, 10)}</span>
}
