interface StaffSalonStatusBadgeProps {
  status?: number
  isManager?: boolean
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: 'Không hoạt động', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  1: { label: 'Đang làm việc', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  2: { label: 'Đã xóa', className: 'bg-red-100 text-red-700 border-red-200' },
}

export function StaffSalonStatusBadge({ status, isManager }: StaffSalonStatusBadgeProps) {
  const config = status !== undefined ? STATUS_MAP[status] : undefined
  return (
    <div className="flex items-center gap-1.5">
      {isManager && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-lotus-admin-base font-medium border bg-violet-100 text-violet-700 border-violet-200">
          Quản lý
        </span>
      )}
      {config ? (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-lotus-admin-base font-medium border ${config.className}`}
        >
          {config.label}
        </span>
      ) : (
        <span className="text-stone-400 text-xs">—</span>
      )}
    </div>
  )
}
