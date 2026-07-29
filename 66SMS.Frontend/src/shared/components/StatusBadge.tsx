// Badge trạng thái — truyền map { label, variant } theo từng giá trị.
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
