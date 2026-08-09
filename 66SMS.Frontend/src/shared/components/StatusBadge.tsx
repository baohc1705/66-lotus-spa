import { Badge, type BadgeVariant } from "@/shared/elements/Badge";

type StatusVariant = BadgeVariant | "error" | "outline";

export interface StatusConfig {
  label: string;
  variant: StatusVariant;
  dot?: boolean;
}

export type StatusMap = Record<string, StatusConfig>;

interface StatusBadgeProps {
  status: string | null | undefined;
  statusMap: StatusMap;
  fallbackLabel?: string;
  className?: string;
}

function toBadgeVariant(variant: StatusVariant): BadgeVariant {
  if (variant === "error") return "danger";
  if (variant === "outline") return "light";
  return variant;
}

export function StatusBadge({
  status,
  statusMap,
  fallbackLabel = "Không rõ",
  className,
}: StatusBadgeProps) {
  const key = status ?? "";
  const config = statusMap[key];

  if (!config) {
    return (
      <Badge variant="light" soft className={className}>
        {fallbackLabel}
      </Badge>
    );
  }

  return (
    <Badge
      variant={toBadgeVariant(config.variant)}
      soft
      className={className}
    >
      {config.dot ? (
        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
      ) : null}
      {config.label}
    </Badge>
  );
}
