import { Shield, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface StaffCertificateStatCardsProps {
  totalCount: number;
  activeCount: number;
  expiredCount: number;
  pendingCount: number;
  isLoading: boolean;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
  isLoading,
}: StatCardProps) {
  return (
    <div className="bg-white border border-stone-100 shadow-sm rounded p-4 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-stone-500 leading-tight mb-1 truncate">
          {label}
        </p>
        {isLoading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p
            className="text-2xl font-bold leading-none tracking-tight"
            style={{ color: valueColor }}
          >
            {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
          </p>
        )}
      </div>
    </div>
  );
}

export function StaffCertificateStatCards({
  totalCount,
  activeCount,
  expiredCount,
  pendingCount,
  isLoading,
}: StaffCertificateStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
      <StatCard
        label="Tổng chứng chỉ"
        value={totalCount}
        icon={Shield}
        iconBg="#dbeafe"
        iconColor="#2563eb"
        valueColor="#1d4ed8"
        isLoading={isLoading}
      />
      <StatCard
        label="Đang hoạt động"
        value={activeCount}
        icon={ShieldCheck}
        iconBg="#dcfce7"
        iconColor="#16a34a"
        valueColor="#15803d"
        isLoading={isLoading}
      />
      <StatCard
        label="Hết hạn"
        value={expiredCount}
        icon={ShieldAlert}
        iconBg="#fee2e2"
        iconColor="#ef4444"
        valueColor="#b91c1c"
        isLoading={isLoading}
      />
      <StatCard
        label="Chờ xác minh"
        value={pendingCount}
        icon={Clock}
        iconBg="#fef3c7"
        iconColor="#d97706"
        valueColor="#b45309"
        isLoading={isLoading}
      />
    </div>
  );
}
