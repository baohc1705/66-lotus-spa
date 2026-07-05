import { Users, UserCheck, Award, Store } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface CustomerStatCardsProps {
  totalCustomers: number;
  activeCustomers: number;
  totalPoints: number;
  walkInCustomers: number;
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

export function CustomerStatCards({
  totalCustomers,
  activeCustomers,
  totalPoints,
  walkInCustomers,
  isLoading,
}: CustomerStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <StatCard
        label="Tổng số khách hàng"
        value={totalCustomers}
        icon={Users}
        iconBg="#dbeafe"
        iconColor="#2563eb"
        valueColor="#1d4ed8"
        isLoading={isLoading}
      />
      <StatCard
        label="Khách hàng hoạt động"
        value={activeCustomers}
        icon={UserCheck}
        iconBg="#dcfce7"
        iconColor="#16a34a"
        valueColor="#15803d"
        isLoading={isLoading}
      />
      <StatCard
        label="Tổng điểm tích lũy"
        value={totalPoints}
        icon={Award}
        iconBg="#fef9c3"
        iconColor="#ca8a04"
        valueColor="#a16207"
        isLoading={isLoading}
      />
      <StatCard
        label="Khách vãng lai (Walk-in)"
        value={walkInCustomers}
        icon={Store}
        iconBg="#f3e8ff"
        iconColor="#9333ea"
        valueColor="#7e22ce"
        isLoading={isLoading}
      />
    </div>
  );
}
