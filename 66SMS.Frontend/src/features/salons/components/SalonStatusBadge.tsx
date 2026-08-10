import { Badge, type BadgeVariant } from "@/shared/elements/Badge";

interface SalonStatusBadgeProps {
  status?: number;
}

const STATUS_CONFIG: Record<
  number,
  { label: string; variant: BadgeVariant }
> = {
  0: { label: "Tạm đóng", variant: "warning" },
  1: { label: "Hoạt động", variant: "success" },
  2: { label: "Đã xóa", variant: "danger" },
  3: { label: "Đóng cửa", variant: "secondary" },
};

export function SalonStatusBadge({ status }: SalonStatusBadgeProps) {
  if (status === undefined) {
    return <span className="text-xs text-kit-muted">—</span>;
  }

  const config = STATUS_CONFIG[status];
  if (!config) {
    return <span className="text-xs text-kit-muted">—</span>;
  }

  return (
    <Badge variant={config.variant} soft>
      {config.label}
    </Badge>
  );
}
