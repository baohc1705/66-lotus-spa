interface SalonStatusBadgeProps {
  status?: number;
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: {
    label: "Tạm đóng",
    className:
      "bg-state-warning-bg text-state-warning-text border-state-warning-border",
  },
  1: {
    label: "Hoạt động",
    className:
      "bg-state-success-bg text-state-success-text border-state-success-border",
  },
  2: {
    label: "Đã xóa",
    className:
      "bg-state-danger-bg text-state-danger-text border-state-danger-border",
  },
  3: {
    label: "Đóng cửa",
    className:
      "bg-state-neutral-bg text-state-neutral-text border-state-neutral-border",
  },
};

export function SalonStatusBadge({ status }: SalonStatusBadgeProps) {
  const config = status !== undefined ? STATUS_MAP[status] : undefined;
  if (!config) return <span className="text-adminGray-400 text-xs">—</span>;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
