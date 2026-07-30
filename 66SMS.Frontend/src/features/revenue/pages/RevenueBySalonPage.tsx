import { formatCurrency } from "@/shared/utils/currency";
import {
  ReportDataTable,
  type ReportColumn,
} from "../components/ReportDataTable";
import { ReportFilterBar } from "../components/ReportFilterBar";
import { ReportStatCards } from "../components/ReportStatCards";
import { RevenueVerticalBarChart } from "../components/RevenueVerticalBarChart";
import { useExportReportBySalon } from "../hooks/useExportExcelRevenueReport";
import { useReportBySalon } from "../hooks/useReportBySalon";
import { useRevenueReportFilters } from "../hooks/useRevenueReportFilters";
import type { ReportRevenueBySalonItemDto } from "../types/revenue.types";

export function RevenueBySalonPage() {
  const filters = useRevenueReportFilters();

  const reportQuery = useReportBySalon({
    from: filters.from,
    to: filters.to,
  });

  const exportExcel = useExportReportBySalon();

  const data = reportQuery.data?.data;
  const rows = data?.rows ?? [];
  const stats = data?.stats;

  const columns: ReportColumn<ReportRevenueBySalonItemDto>[] = [
    {
      key: "salonName",
      header: "Tên salon",
      render: (r) => r.salonName,
    },
    {
      key: "staffCount",
      header: "Số nhân viên",
      render: (r) => r.staffCount,
    },
    {
      key: "orderCount",
      header: "Số đơn hàng",
      render: (r) => r.orderCount,
    },
    {
      key: "cashIn",
      header: "Tổng tiền thu",
      render: (r) => formatCurrency(r.cashIn),
    },
    {
      key: "cashOut",
      header: "Tổng tiền chi",
      render: (r) => formatCurrency(r.commissionOut),
    },
    {
      key: "totalRevenue",
      header: "Tổng doanh thu",
      render: (r) => formatCurrency(r.totalRevenue),
    },
  ];

  const chartData = rows.map((r: ReportRevenueBySalonItemDto) => ({
    label: r.salonName,
    revenue: r.totalRevenue,
  }));

  return (
    <div className="space-y-2 p-2">
      <h1 className="text-lg font-bold">Báo cáo doanh thu theo thời gian</h1>
      <ReportFilterBar
        salonId={filters.salonId}
        from={filters.from}
        to={filters.to}
        grain={filters.grain}
        onSalonChange={filters.setSalonId}
        onFromChange={filters.setFrom}
        onToChange={filters.setTo}
        onGrainChange={filters.setGrain}
        onExport={() =>
          exportExcel.mutate({ from: filters.from, to: filters.to })
        }
        exporting={exportExcel.isPending}
      />

      {stats && (
        <ReportStatCards
          cards={[
            {
              title: "Tổng doanh thu",
              value: formatCurrency(stats.totalRevenue),
              className: "bg-sky-500",
            },
            {
              title: "Tổng thu",
              value: formatCurrency(stats.totalCollected),
              className: "bg-rose-500",
            },
            {
              title: "Tổng chi",
              value: formatCurrency(stats.totalCommission),
              className: "bg-violet-500",
            },
            {
              title: "Lợi nhuận",
              value: formatCurrency(stats.profit),
              className: "bg-emerald-500",
            },
          ]}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-2">
        <div className="xl:col-span-2">
          <RevenueVerticalBarChart
            data={chartData}
            title="Doanh thu theo chi nhánh"
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
