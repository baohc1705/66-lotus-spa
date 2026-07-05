import { Activity, TrendingUp, PackageCheck, Clock } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface ServiceStatCardsProps {
  totalServices: number;
  activeServices: number;
  servicesWithProducts: number;
  avgDurationMins: number;
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

export function ServiceStatCards({
  totalServices,
  activeServices,
  servicesWithProducts,
  avgDurationMins,
  isLoading,
}: ServiceStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <StatCard
        label="Tổng số dịch vụ"
        value={totalServices}
        icon={Activity}
        iconBg="#dcfce7"
        iconColor="#16a34a"
        valueColor="#15803d"
        isLoading={isLoading}
      />
      <StatCard
        label="Dịch vụ đang kinh doanh"
        value={activeServices}
        icon={TrendingUp}
        iconBg="#dbeafe"
        iconColor="#2563eb"
        valueColor="#1d4ed8"
        isLoading={isLoading}
      />
      <StatCard
        label="Dịch vụ có sử dụng sản phẩm"
        value={servicesWithProducts}
        icon={PackageCheck}
        iconBg="#ffedd5"
        iconColor="#ea580c"
        valueColor="#c2410c"
        isLoading={isLoading}
      />
      <StatCard
        label="Thời lượng TB (phút)"
        value={avgDurationMins}
        icon={Clock}
        iconBg="#ede9fe"
        iconColor="#7c3aed"
        valueColor="#6d28d9"
        isLoading={isLoading}
      />
    </div>
  );
}
