import {
  CalendarCheck,
  Clock3,
  Coins,
  HandCoins,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { AdminStatCard } from "@/shared/components/AdminStatCard";
import type {
  PayrollCommissionDailySummaryDto,
  PayrollCommissionSummaryDto,
} from "../types/payroll.types";

interface PayrollStatCardsProps {
  summary:
    | PayrollCommissionSummaryDto
    | PayrollCommissionDailySummaryDto
    | undefined;
  viewMode: "day" | "week" | "month";
  isLoading: boolean;
}

function isDailySummary(
  summary: PayrollCommissionSummaryDto | PayrollCommissionDailySummaryDto,
): summary is PayrollCommissionDailySummaryDto {
  return "totalOrders" in summary;
}

export function PayrollStatCards({
  summary,
  viewMode,
  isLoading,
}: PayrollStatCardsProps) {
  const isMonth = viewMode === "month";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
      {isMonth ? (
        <>
          <AdminStatCard
            label="Tổng đơn hàng"
            value={
              summary && isDailySummary(summary) ? summary.totalOrders : 0
            }
            icon={ShoppingBag}
            tone="gold"
            isLoading={isLoading}
          />
          <AdminStatCard
            label="Giờ phục vụ"
            value={
              summary && isDailySummary(summary)
                ? Number(summary.totalServiceHours).toFixed(1)
                : "0"
            }
            icon={Clock3}
            tone="info"
            isLoading={isLoading}
          />
        </>
      ) : (
        <>
          <AdminStatCard
            label="Lịch hẹn"
            value={
              summary && !isDailySummary(summary)
                ? summary.totalAppointments
                : 0
            }
            icon={CalendarCheck}
            tone="info"
            isLoading={isLoading}
          />
          <AdminStatCard
            label="Dịch vụ"
            value={
              summary && !isDailySummary(summary) ? summary.totalServices : 0
            }
            icon={Sparkles}
            tone="gold"
            isLoading={isLoading}
          />
        </>
      )}
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
        icon={Coins}
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
