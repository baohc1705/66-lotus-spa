import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";
import type { SalonListItem } from "@/features/salons/types/salon.types";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";
import { formatCurrency } from "@/shared/utils/currency";
import {
  ReportDataTable,
  type ReportColumn,
} from "../components/ReportDataTable";
import { ReportFilterBar } from "../components/ReportFilterBar";
import { RevenueHorizontalBarChart } from "../components/RevenueHorizontalBarChart";
import { useExportReportByService } from "../hooks/useExportExcelRevenueReport";
import { useReportByService } from "../hooks/useReportByService";
import { useRevenueReportFilters } from "../hooks/useRevenueReportFilters";
import type { ReportRevenueByServiceItemDto } from "../types/revenue.types";

export function RevenueByServicePage() {
  const filters = useRevenueReportFilters();
  const { data: salons = [] } = useActiveSalons();
  const { data: categoriesResult } = useServiceCategories({
    pageIndex: 1,
    pageSize: 100,
  });

  const reportQuery = useReportByService({
    from: filters.from,
    to: filters.to,
    salonId: filters.salonId,
    categoryId: filters.categoryId,
  });

  const exportExcel = useExportReportByService();

  const rows = reportQuery.data?.data ?? [];
  const categories = categoriesResult?.data?.items ?? [];

  const columns: ReportColumn<ReportRevenueByServiceItemDto>[] = [
    {
      key: "itemId",
      header: "Mã dịch vụ",
      render: (r) => r.itemId,
    },
    {
      key: "itemName",
      header: "Tên dịch vụ",
      render: (r) => r.itemName,
    },
    {
      key: "quantity",
      header: "Số lượng",
      render: (r) => r.quantity,
    },
    {
      key: "avgCommissionRate",
      header: "Tỷ lệ hoa hồng TB",
      render: (r) => `${r.avgCommissionRate}%`,
    },
    {
      key: "commission",
      header: "Tổng hoa hồng",
      render: (r) => formatCurrency(r.commission),
    },
    {
      key: "revenue",
      header: "Doanh thu dịch vụ",
      render: (r) => formatCurrency(r.revenue),
    },
    {
      key: "totalRevenue",
      header: "Tổng doanh thu",
      render: (r) => formatCurrency(r.totalRevenue),
    },
  ];

  const chartData = rows.map((r: ReportRevenueByServiceItemDto) => ({
    label: r.itemName,
    revenue: r.totalRevenue,
  }));

  const salonOptions = salons
    .filter((s: SalonListItem) => s.id != null)
    .map((s: SalonListItem) => ({
      id: s.id as number,
      name: s.name ?? "",
    }));

  const categoryOptions = categories
    .filter((c: ServiceCategoryDto) => c.id != null)
    .map((c: ServiceCategoryDto) => ({
      id: c.id as number,
      name: c.name ?? "",
    }));

  return (
    <div className="space-y-2 p-2">
      <h1 className="text-lg font-bold">Báo cáo doanh thu theo dịch vụ</h1>
      <ReportFilterBar
        showSalon
        showCategory
        salons={salonOptions}
        categories={categoryOptions}
        salonId={filters.salonId}
        categoryId={filters.categoryId}
        from={filters.from}
        to={filters.to}
        onSalonChange={filters.setSalonId}
        onCategoryChange={filters.setCategoryId}
        onFromChange={filters.setFrom}
        onToChange={filters.setTo}
        onExport={() =>
          exportExcel.mutate({
            from: filters.from,
            to: filters.to,
            salonId: filters.salonId,
            categoryId: filters.categoryId,
          })
        }
        exporting={exportExcel.isPending}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-2">
        <div className="xl:col-span-2">
          <RevenueHorizontalBarChart
            data={chartData}
            title="Doanh thu theo dịch vụ"
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
