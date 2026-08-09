import { Badge, type BadgeVariant } from "@/shared/elements/Badge";
import { formatDisplayDate } from "@/shared/utils/date.utils";

interface Props {
  status?: number;
  expiryDate?: string;
}

const STATUS_CONFIG: Record<
  number,
  { label: string; variant: BadgeVariant }
> = {
  0: { label: "Chờ xác minh", variant: "warning" },
  1: { label: "Hiệu lực", variant: "success" },
  2: { label: "Hết hạn", variant: "danger" },
  3: { label: "Đã thu hồi", variant: "secondary" },
};

export function CertificateStatusBadge({ status }: Props) {
  if (status === 9 || status === undefined) return null;

  const config = STATUS_CONFIG[status] ?? {
    label: "Không rõ",
    variant: "secondary" as BadgeVariant,
  };

  return (
    <Badge variant={config.variant} soft>
      {config.label}
    </Badge>
  );
}

export function ExpiryBadge({ expiryDate }: { expiryDate?: string }) {
  if (!expiryDate) {
    return <span className="text-xs text-kit-muted">Không hết hạn</span>;
  }

  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return (
      <span className="text-xs font-medium text-kit-danger">
        {formatDisplayDate(expiryDate)} (Hết hạn)
      </span>
    );
  }
  if (diffDays <= 30) {
    return (
      <span className="text-xs font-medium text-kit-warning">
        {formatDisplayDate(expiryDate)} (còn {diffDays} ngày)
      </span>
    );
  }
  return (
    <span className="text-xs text-kit-muted">
      {formatDisplayDate(expiryDate)}
    </span>
  );
}
