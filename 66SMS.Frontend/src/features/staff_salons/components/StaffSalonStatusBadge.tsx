import { Badge } from "@/shared/elements/Badge";

interface StaffSalonStatusBadgeProps {
  status?: number;
  isManager?: boolean;
}

export function StaffSalonStatusBadge({ status }: StaffSalonStatusBadgeProps) {
  if (status === 1) {
    return (
      <Badge variant="success" soft>
        Đang làm việc
      </Badge>
    );
  }
  if (status === 0) {
    return (
      <Badge variant="danger" soft>
        Đã nghỉ
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" soft>
      —
    </Badge>
  );
}
