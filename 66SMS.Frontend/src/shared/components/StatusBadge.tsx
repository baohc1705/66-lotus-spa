// Badge hiển thị trạng thái với màu sắc tương ứng.
// Nhận vào một map từ giá trị → { label, color } để tự cấu hình màu.
import { Badge, type BadgeProps } from '@/shared/components/ui/badge'

export interface StatusConfig {
  label: string
  variant: BadgeProps['variant']
  dot?: boolean
}

export type StatusMap = Record<string, StatusConfig>

interface StatusBadgeProps {
  status: string | null | undefined
  statusMap: StatusMap
  fallbackLabel?: string
  className?: string
}

/**
 * StatusBadge - Badge trạng thái reusable cho mọi entity
 *
 * @example
 * const EMPLOYEE_STATUS: StatusMap = {
 *   '0': { label: 'Nghỉ việc', variant: 'error' },
 *   '1': { label: 'Đang làm', variant: 'success', dot: true },
 *   '2': { label: 'Tạm nghỉ', variant: 'warning' },
 * }
 * <StatusBadge status={employee.status} statusMap={EMPLOYEE_STATUS} />
 */
export function StatusBadge({ status, statusMap, fallbackLabel = 'Không rõ', className }: StatusBadgeProps) {
  const key = status ?? ''
  const config = statusMap[key]

  if (!config) {
    return (
      <Badge variant="outline" size="sm" className={className}>
        {fallbackLabel}
      </Badge>
    )
  }

  return (
    <Badge variant={config.variant} size="sm" dot={config.dot} className={className}>
      {config.label}
    </Badge>
  )
}
