import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/shared/utils/currency";

export type AdminStatTone = "green" | "gold" | "warning" | "danger" | "info";

const TONE_BOX: Record<AdminStatTone, string> = {
  green: "admin-stat-icon--green",
  gold: "admin-stat-icon--gold",
  warning: "bg-state-warning-bg text-state-warning-text",
  danger: "bg-state-danger-bg text-state-danger-text",
  info: "bg-state-info-bg text-state-info-text",
};

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  /** Icon nổi bật — mặc định gold theo bảng màu admin */
  tone?: AdminStatTone;
  valueClass?: string;
  isLoading?: boolean;
  isCurrency?: boolean;
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone = "gold",
  valueClass = "text-adminInk",
  isLoading = false,
  isCurrency = false,
}: AdminStatCardProps) {
  return (
    <div className="bg-white border border-adminGray-100 shadow-sm rounded-admin p-4 flex items-center gap-4">
      <div
        className={cn(
          "w-12 h-12 rounded-admin flex items-center justify-center shrink-0",
          TONE_BOX[tone],
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-adminGray-600 leading-tight mb-1 truncate">
          {label}
        </p>
        {isLoading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className={cn("text-2xl font-bold leading-none tracking-tight", valueClass)}>
            {typeof value === "number"
              ? isCurrency
                ? formatCurrency(value)
                : value.toLocaleString("vi-VN")
              : value}
          </p>
        )}
      </div>
    </div>
  );
}
