import { Users, UserCheck, Award, Store } from "lucide-react";
import { AdminStatCard } from "@/shared/components/AdminStatCard";

interface CustomerStatCardsProps {
  totalCustomers: number;
  activeCustomers: number;
  totalPoints: number;
  walkInCustomers: number;
  isLoading: boolean;
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
      <AdminStatCard label="Tổng số khách hàng" value={totalCustomers} icon={Users} tone="gold" isLoading={isLoading} />
      <AdminStatCard label="Khách hàng hoạt động" value={activeCustomers} icon={UserCheck} tone="green" isLoading={isLoading} />
      <AdminStatCard label="Tổng điểm tích lũy" value={totalPoints} icon={Award} tone="gold" valueClass="text-adminGold-600" isLoading={isLoading} />
      <AdminStatCard label="Khách vãng lai (Walk-in)" value={walkInCustomers} icon={Store} tone="gold" isLoading={isLoading} />
    </div>
  );
}
