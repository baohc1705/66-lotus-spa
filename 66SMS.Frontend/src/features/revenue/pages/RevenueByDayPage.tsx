import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";
import type { SalonListItem } from "@/features/salons/types/salon.types";
import { formatCurrency } from "@/shared/utils/currency";
import {
  ReportDataTable,
  type ReportColumn,
} from "../components/ReportDataTable";
import { ReportFilterBar } from "../components/ReportFilterBar";
import { ReportStatCards } from "../components/ReportStatCards";
import { RevenueVerticalBarChart } from "../components/RevenueVerticalBarChart";
import { useExportReportByPeriod } from "../hooks/useExportExcelRevenueReport";
import { useReportByPeriod } from "../hooks/useReportByPeriod";
import { useRevenueReportFilters } from "../hooks/useRevenueReportFilters";
import type { ReportRevenueByPeriodItemDto } from "../types/revenue.types";
import { formatPeriodLabel } from "../utils/formatPeriodLabel";

export function RevenueByDayPage() {
  const filters = useRevenueReportFilters();
  const { data: salons = [] } = useActiveSalons();

  const reportQuery = useReportByPeriod({
    from: filters.from,
    to: filters.to,
    salonId: filters.salonId,
    grain: filters.grain,
  });

  const exportExcel = useExportReportByPeriod();

  const data = reportQuery.data?.data;
  const rows = data?.rows ?? [];
  const stats = data?.stats;

  const columns: ReportColumn<ReportRevenueByPeriodItemDto>[] = [
    {
      key: "period",
      header: "Thời gian",
      render: (r) => formatPeriodLabel(r.periodKey),
    },
    { key: "orders", header: "Số đơn hàng", render: (r) => r.orderCount },
    {
      key: "invoice",
      header: "Tổng tiền từ hóa đơn",
      render: (r) => formatCurrency(r.invoiceTotal),
    },
    {
      key: "commission",
      header: "Tổng hoa hồng",
      render: (r) => formatCurrency(r.commissionTotal),
    },
    {
      key: "net",
      header: "Tổng thực thu",
      render: (r) => formatCurrency(r.totalRevenue),
    },
  ];

  const chartData = rows.map((r: ReportRevenueByPeriodItemDto) => ({
    label: formatPeriodLabel(r.periodKey),
    revenue: r.invoiceTotal,
  }));

  const salonOptions = salons
    .filter((s: SalonListItem) => s.id != null)
    .map((s: SalonListItem) => ({
      id: s.id as number,
      name: s.name ?? "",
    }));

  return (
    <div className="space-y-0 pb-6 font-sans text-sm text-kit-body">
      <ReportFilterBar
        showSalon
        showGrain
        salons={salonOptions}
        salonId={filters.salonId}
        from={filters.from}
        to={filters.to}
        grain={filters.grain}
        onSalonChange={filters.setSalonId}
        onFromChange={filters.setFrom}
        onToChange={filters.setTo}
        onGrainChange={filters.setGrain}
        onExport={() =>
          exportExcel.mutate({
            from: filters.from,
            to: filters.to,
            grain: filters.grain,
            salonId: filters.salonId,
          })
        }
        exporting={exportExcel.isPending}
      />

      {stats ? (
        <ReportStatCards
          cards={[
            {
              title: "Tổng doanh thu",
              description: "Thực thu trong kỳ",
              value: formatCurrency(stats.totalRevenue),
              tone: "love-kiss",
              valueTone: "white",
            },
            {
              title: "Tổng chi",
              description: "Chi phí trong kỳ",
              value: formatCurrency(stats.totalExpense),
              tone: "premium-dark",
              valueTone: "warning",
            },
            {
              title: "Số đơn hàng",
              description: "Hóa đơn đã thanh toán",
              value: String(stats.orderCount),
              tone: "arielle-smile",
              valueTone: "white",
            },
            {
              title: "Lợi nhuận",
              description: "Doanh thu trừ chi",
              value: formatCurrency(stats.profit),
              tone: "happy-green",
              valueTone: "dark",
            },
          ]}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <RevenueVerticalBarChart
            data={chartData}
            title="Doanh thu theo thời gian"
          />
        </div>
        <div className="xl:col-span-3">
          <ReportDataTable
            title="Bảng số liệu chi tiết"
            columns={columns}
            rows={rows}
          />
        </div>
      </div>
    </div>
  );
}
