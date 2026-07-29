interface StaffSalonStatusBadgeProps {
  status?: number;
  isManager?: boolean;
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: {
    label: "Đã nghỉ",
    className:
      "bg-state-danger-bg text-state-danger-text border-state-danger-border",
  },
  1: {
    label: "Đang làm việc",
    className:
      "bg-state-success-bg text-state-success-text border-state-success-border",
  },
};

export function StaffSalonStatusBadge({ status }: StaffSalonStatusBadgeProps) {
  const config = status !== undefined ? STATUS_MAP[status] : undefined;
  return (
    <div className="flex items-center gap-1.5">
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
  );
}
