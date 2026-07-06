interface SalonStatusBadgeProps {
  status?: number
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: 'Tạm đóng', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  1: { label: 'Hoạt động', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  2: { label: 'Đã xóa', className: 'bg-red-100 text-red-700 border-red-200' },
  3: { label: 'Đóng cửa', className: 'bg-stone-100 text-stone-600 border-stone-200' },
}

export function SalonStatusBadge({ status }: SalonStatusBadgeProps) {
  const config = status !== undefined ? STATUS_MAP[status] : undefined
  if (!config) return <span className="text-stone-400 text-xs">—</span>
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-lotus-admin-base font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  )
}
