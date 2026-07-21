import {
  CalendarCheck,
  Coins,
  HandCoins,
  Sparkles,
  Wallet,
} from "lucide-react";
import { AdminStatCard } from "@/shared/components/AdminStatCard";
import type { PayrollCommissionSummaryDto } from "../types/payroll.types";

interface PayrollStatCardsProps {
  summary: PayrollCommissionSummaryDto | undefined;
  isLoading: boolean;
}

export function PayrollStatCards({
  summary,
  isLoading,
}: PayrollStatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
      <AdminStatCard
        label="Lịch hẹn"
        value={summary?.totalAppointments ?? 0}
        icon={CalendarCheck}
        tone="info"
        isLoading={isLoading}
      />
      <AdminStatCard
        label="Dịch vụ"
        value={summary?.totalServices ?? 0}
        icon={Sparkles}
        tone="gold"
        isLoading={isLoading}
      />
      <AdminStatCard
        label="Hoa hồng kỳ"
        value={summary?.totalCommission ?? 0}
        icon={HandCoins}
        tone="green"
        isLoading={isLoading}
        isCurrency
      />
      <AdminStatCard
        label="Lương CB tháng"
        value={summary?.basicSalary ?? 0}
        icon={Wallet}
        tone="gold"
        isLoading={isLoading}
        isCurrency
      />
      <AdminStatCard
        label="Ước tính CB + HH"
        value={summary?.estimatedTotal ?? 0}
        icon={Coins}
        tone="green"
        isLoading={isLoading}
        isCurrency
        valueClass="text-primary"
      />
    </div>
  );
}
