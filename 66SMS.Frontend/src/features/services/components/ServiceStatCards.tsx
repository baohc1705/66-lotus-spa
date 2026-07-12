import { Activity, TrendingUp, PackageCheck, Clock } from "lucide-react";
import { AdminStatCard } from "@/shared/components/AdminStatCard";

interface ServiceStatCardsProps {
  totalServices: number;
  activeServices: number;
  servicesWithProducts: number;
  avgDurationMins: number;
  isLoading: boolean;
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
      <AdminStatCard label="Tổng số dịch vụ" value={totalServices} icon={Activity} tone="gold" isLoading={isLoading} />
      <AdminStatCard label="Dịch vụ đang kinh doanh" value={activeServices} icon={TrendingUp} tone="green" isLoading={isLoading} />
      <AdminStatCard label="Dịch vụ có sử dụng sản phẩm" value={servicesWithProducts} icon={PackageCheck} tone="gold" isLoading={isLoading} />
      <AdminStatCard label="Thời lượng TB (phút)" value={avgDurationMins} icon={Clock} tone="gold" isLoading={isLoading} />
    </div>
  );
}
