import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";
import type { SalonListItem } from "@/features/salons/types/salon.types";
import { formatCurrency } from "@/shared/utils/currency";
import {
    ReportDataTable,
    type ReportColumn,
} from "../components/ReportDataTable";
import { ReportFilterBar } from "../components/ReportFilterBar";
import { RevenueHorizontalBarChart } from "../components/RevenueHorizontalBarChart";
import { useExportReportByStaff } from "../hooks/useExportExcelRevenueReport";
import { useReportByStaff } from "../hooks/useReportByStaff";
import { useRevenueReportFilters } from "../hooks/useRevenueReportFilters";
import type { ReportRevenueByStaffItemDto } from "../types/revenue.types";

export function RevenueByStaffPage() {
  const filters = useRevenueReportFilters();
  const { data: salons = [] } = useActiveSalons();

  const reportQuery = useReportByStaff({
    from: filters.from,
    to: filters.to,
    salonId: filters.salonId,
  });

  const exportExcel = useExportReportByStaff();

  const rows = reportQuery.data?.data ?? [];

  const columns: ReportColumn<ReportRevenueByStaffItemDto>[] = [
    {
      key: "staffId",
      header: "Mã nhân viên",
      render: (r) => r.staffId,
    },
    {
      key: "staffName",
      header: "Tên nhân viên",
      render: (r) => r.staffName,
    },
    {
      key: "serviceCount",
      header: "Số dịch vụ",
      render: (r) => r.serviceCount,
    },
    {
      key: "serviceRevenue",
      header: "Doanh thu dịch vụ",
      render: (r) => formatCurrency(r.serviceRevenue),
    },
    {
      key: "commission",
      header: "Tổng hoa hồng",
      render: (r) => formatCurrency(r.commission),
    },
    {
      key: "totalRevenue",
      header: "Tổng doanh thu",
      render: (r) => formatCurrency(r.totalRevenue),
    },
  ];

  const chartData = rows.map((r: ReportRevenueByStaffItemDto) => ({
    label: r.staffName,
    revenue: r.totalRevenue,
  }));

  const salonOptions = salons
    .filter((s: SalonListItem) => s.id != null)
    .map((s: SalonListItem) => ({
      id: s.id as number,
      name: s.name ?? "",
    }));

  return (
    <div className="space-y-2 p-2">
      <h1 className="text-lg font-bold">Báo cáo doanh thu theo nhân viên</h1>
      <ReportFilterBar
        showSalon
        salons={salonOptions}
        salonId={filters.salonId}
        from={filters.from}
        to={filters.to}
        onSalonChange={filters.setSalonId}
        onFromChange={filters.setFrom}
        onToChange={filters.setTo}
        onExport={() =>
          exportExcel.mutate({
            from: filters.from,
            to: filters.to,
            salonId: filters.salonId,
          })
        }
        exporting={exportExcel.isPending}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-2">
        <div className="xl:col-span-2">
          <RevenueHorizontalBarChart
            data={chartData}
            title="Doanh thu theo nhân viên"
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
