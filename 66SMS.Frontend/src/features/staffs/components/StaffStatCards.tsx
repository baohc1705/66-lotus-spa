import { Users, UserCheck, UserMinus, DollarSign } from "lucide-react";
import { formatCurrency } from "@/shared/utils/currency";
import { AdminStatCard } from "@/shared/components/AdminStatCard";

interface StaffStatCardsProps {
  totalStaffs: number;
  activeStaffs: number;
  inactiveStaffs: number;
  avgSalary: number;
  isLoading: boolean;
}

export function StaffStatCards({
  totalStaffs,
  activeStaffs,
  inactiveStaffs,
  avgSalary,
  isLoading,
}: StaffStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <AdminStatCard
        label="Tổng số nhân viên"
        value={totalStaffs}
        icon={Users}
        tone="gold"
        isLoading={isLoading}
      />
      <AdminStatCard
        label="Đang làm việc"
        value={activeStaffs}
        icon={UserCheck}
        tone="green"
        isLoading={isLoading}
      />
      <AdminStatCard
        label="Tạm nghỉ"
        value={inactiveStaffs}
        icon={UserMinus}
        tone="gold"
        isLoading={isLoading}
      />
      <AdminStatCard
        label="Lương cơ bản TB"
        value={avgSalary > 0 ? formatCurrency(avgSalary) : "—"}
        icon={DollarSign}
        tone="gold"
        valueClass="text-adminGold-600"
        isLoading={isLoading}
      />
    </div>
  );
}
