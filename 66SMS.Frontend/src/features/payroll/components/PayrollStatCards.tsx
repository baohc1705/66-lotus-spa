import { StatCard } from "@/shared/widgets/StatCard";
import { formatCurrency } from "@/shared/utils/currency";

import type {
  PayrollCommissionDailySummaryDto,
  PayrollCommissionSummaryDto,
} from "../types/payroll.types";

type PayrollStatCardsProps = {
  summary:
    | PayrollCommissionSummaryDto
    | PayrollCommissionDailySummaryDto
    | undefined;
  viewMode: "day" | "week" | "month";
  isLoading: boolean;
};

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
  const dash = isLoading ? "—" : undefined;

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
      {isMonth ? (
        <>
          <StatCard
            title="Tổng đơn hàng"
            value={
              dash ??
              (summary && isDailySummary(summary) ? summary.totalOrders : 0)
            }
            description="Trong tháng"
            tone="sunny-morning"
            valueTone="dark"
          />
          <StatCard
            title="Giờ phục vụ"
            value={
              dash ??
              (summary && isDailySummary(summary)
                ? Number(summary.totalServiceHours).toFixed(1)
                : "0")
            }
            description="Tổng giờ"
            tone="tempting-azure"
            valueTone="white"
          />
        </>
      ) : (
        <>
          <StatCard
            title="Lịch hẹn"
            value={
              dash ??
              (summary && !isDailySummary(summary)
                ? summary.totalAppointments
                : 0)
            }
            description="Đã thanh toán"
            tone="tempting-azure"
            valueTone="white"
          />
          <StatCard
            title="Dịch vụ"
            value={
              dash ??
              (summary && !isDailySummary(summary) ? summary.totalServices : 0)
            }
            description="Trong kỳ"
            tone="sunny-morning"
            valueTone="dark"
          />
        </>
      )}
      <StatCard
        title="Hoa hồng kỳ"
        value={dash ?? formatCurrency(summary?.totalCommission ?? 0)}
        description="Theo hóa đơn đã thanh toán"
        tone="happy-green"
        valueTone="white"
      />
      <StatCard
        title="Lương CB tháng"
        value={dash ?? formatCurrency(summary?.basicSalary ?? 0)}
        description="Lương cơ bản"
        tone="midnight-bloom"
        valueTone="white"
      />
      <StatCard
        title="Ước tính CB + HH"
        value={dash ?? formatCurrency(summary?.estimatedTotal ?? 0)}
        description="Tạm tính"
        tone="happy-green"
        valueTone="white"
      />
    </div>
  );
}
