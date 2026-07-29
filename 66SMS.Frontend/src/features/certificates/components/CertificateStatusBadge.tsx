import { Badge } from "@/shared/components/ui/badge";
import { formatDisplayDate } from "@/shared/utils/date.utils";

interface Props {
  status?: number;
  expiryDate?: string;
}

export function CertificateStatusBadge({ status }: Props) {
  if (status === 9 || status === undefined) return null;

  const statusLabels: Record<number, { label: string; className: string }> = {
    0: {
      label: "Chờ xác minh",
      className:
        "bg-state-warning-bg text-state-warning-text border-state-warning-border",
    },
    1: {
      label: "Hiệu lực",
      className:
        "bg-state-success-bg text-state-success-text border-state-success-border",
    },
    2: {
      label: "Hết hạn",
      className:
        "bg-state-danger-bg text-state-danger-text border-state-danger-border",
    },
    3: {
      label: "Đã thu hồi",
      className:
        "bg-state-neutral-bg text-state-neutral-text border-state-neutral-border",
    },
  };

  const config = statusLabels[status] ?? {
    label: "Không rõ",
    className: "bg-state-neutral-bg text-state-neutral-text",
  };

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

export function ExpiryBadge({ expiryDate }: { expiryDate?: string }) {
  if (!expiryDate) {
    return <span className="text-xs text-adminGray-400">Không hết hạn</span>;
  }

  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return (
      <span className="text-xs font-medium text-state-danger-text">
        {formatDisplayDate(expiryDate)} (Hết hạn)
      </span>
    );
  }
  if (diffDays <= 30) {
    return (
      <span className="text-xs font-medium text-state-warning-text">
        {formatDisplayDate(expiryDate)} (còn {diffDays} ngày)
      </span>
    );
  }
  return (
    <span className="text-xs text-adminGray-600">
      {formatDisplayDate(expiryDate)}
    </span>
  );
}
