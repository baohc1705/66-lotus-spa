interface StaffSalonStatusBadgeProps {
  status?: number
  isManager?: boolean
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: 'Không hoạt động', className: 'bg-state-warning-bg text-state-warning-text border-state-warning-border' },
  1: { label: 'Đang làm việc', className: 'bg-state-success-bg text-state-success-text border-state-success-border' },
  2: { label: 'Đã xóa', className: 'bg-state-danger-bg text-state-danger-text border-state-danger-border' },
}

export function StaffSalonStatusBadge({ status, isManager }: StaffSalonStatusBadgeProps) {
  const config = status !== undefined ? STATUS_MAP[status] : undefined
  return (
    <div className="flex items-center gap-1.5">
      {isManager && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-adminGold-100 text-adminGold-700 border-adminGold-600/30">
          Quản lý
        </span>
      )}
      {config ? (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
        >
          {config.label}
        </span>
      ) : (
        <span className="text-adminGray-400 text-xs">—</span>
      )}
    </div>
  )
}
