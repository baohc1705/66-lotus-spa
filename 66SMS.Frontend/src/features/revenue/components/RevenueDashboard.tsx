import { useMemo } from "react";
import { RefreshCw, CalendarRange, Download } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  useRevenueFilters,
  type RevenuePreset,
} from "../hooks/useRevenueFilters";
import {
  useRevenueSummary,
  useRevenueTrend,
  useRevenueBreakdown,
  useTopRevenueItems,
  useTodaySummary,
  useTopStaff,
} from "../hooks/useRevenueDashboard";
import { useExportRevenueBySalon } from "../hooks/useExportRevenueBySalon";
import { useExportBranchRevenue } from "../hooks/useExportBranchRevenue";

import { RevenueKpiCards } from "./RevenueKpiCards";
import { CashFlowTrendChart } from "./CashFlowTrendChart";
import { RevenueByItemTypeChart } from "./RevenueByItemTypeChart";
import { TopRevenueItemsTable } from "./TopRevenueItemsTable";
import { TodayAppointmentsCard } from "./TodayAppointmentsCard";
import { TodayCustomersCard } from "./TodayCustomersCard";
import { TodayCashSummaryCard } from "./TodayCashSummaryCard";
import { CustomerTrafficChart } from "./CustomerTrafficChart";
import { NetRevenueBarChart } from "./NetRevenueBarChart";
import { TopStaffTable } from "./TopStaffTable";

const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= current - 5; y--) {
    years.push(y);
  }
  return years;
})();

export function RevenueDashboard() {
  const queryClient = useQueryClient();
  const selectedSalonId = useAuthStore((state) => state.selectedSalonId);
  const getEffectiveSalonId = useAuthStore((state) => state.getEffectiveSalonId);
  const isAdmin = useAuthStore((state) => state.hasRole("Admin"));
  const isManager = useAuthStore((state) => state.hasRole("Manager"));

  const {
    preset,
    from,
    to,
    setPreset,
    selectedDay,
    setSelectedDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
  } = useRevenueFilters();

  const exportBySalonMutation = useExportRevenueBySalon();
  const exportBranchMutation = useExportBranchRevenue();

  const branchSalonId = isAdmin ? selectedSalonId : getEffectiveSalonId();
  const canExportBranch = (isManager || isAdmin) && branchSalonId != null && branchSalonId > 0;

  const queryParams = useMemo(
    () => ({
      from,
      to,
      salonId: selectedSalonId,
      comparePrevious: true,
    }),
    [from, to, selectedSalonId],
  );

  const summaryQuery = useRevenueSummary(queryParams);
  const trendQuery = useRevenueTrend(queryParams);
  const breakdownQuery = useRevenueBreakdown(queryParams);
  const topServicesQuery = useTopRevenueItems(queryParams, "service", 5);
  const topProductsQuery = useTopRevenueItems(queryParams, "product", 5);
  const todayQuery = useTodaySummary(selectedSalonId);
  const topStaffQuery = useTopStaff(selectedSalonId, from, to, 5);

  const isRefreshing =
    summaryQuery.isFetching ||
    trendQuery.isFetching ||
    breakdownQuery.isFetching ||
    topServicesQuery.isFetching ||
    topProductsQuery.isFetching ||
    todayQuery.isFetching ||
    topStaffQuery.isFetching;

  const isLoading =
    summaryQuery.isLoading || trendQuery.isLoading || breakdownQuery.isLoading;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["revenue"] });
  };

  const handleExportBySalon = () => {
    exportBySalonMutation.mutate({ from, to });
  };

  const handleExportBranch = () => {
    if (branchSalonId == null || branchSalonId <= 0) {
      toast.error("Vui lòng chọn chi nhánh để xuất báo cáo.");
      return;
    }
    exportBranchMutation.mutate({ from, to, salonId: branchSalonId });
  };

  const inputClass =
    "text-xs text-adminInk font-semibold bg-transparent border-none outline-none cursor-pointer";

  return (
    <div className="space-y-2 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 bg-white border border-adminGray-100 rounded-admin h-9 px-3">
            <CalendarRange className="w-3.5 h-3.5 text-adminGray-400" />
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as RevenuePreset)}
              className={inputClass}
            >
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="thisMonth">Tháng này</option>
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          </div>

          {preset === "day" && (
            <div className="flex items-center bg-white border border-adminGray-100 rounded-admin h-9 px-3">
              <input
                type="date"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {preset === "month" && (
            <div className="flex items-center bg-white border border-adminGray-100 rounded-admin h-9 px-3">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {preset === "year" && (
            <div className="flex items-center bg-white border border-adminGray-100 rounded-admin h-9 px-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={inputClass}
              >
                {YEAR_OPTIONS.map((y: number) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`w-9 h-9 bg-white border border-adminGray-100 rounded-admin flex items-center justify-center hover:bg-adminGray-50 transition-colors ${
              isRefreshing ? "opacity-50" : ""
            }`}
            title="Làm mới báo cáo"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-adminGray-400 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>

          {isAdmin && (
            <button
              onClick={handleExportBySalon}
              disabled={exportBySalonMutation.isPending}
              className={`h-9 px-3 bg-white border border-adminGray-100 rounded-admin flex items-center gap-1.5 hover:bg-adminGray-50 transition-colors text-xs font-semibold text-adminInk ${
                exportBySalonMutation.isPending ? "opacity-50" : ""
              }`}
              title="Xuất Excel so sánh tất cả chi nhánh"
            >
              <Download
                className={`w-3.5 h-3.5 text-adminGray-400 ${exportBySalonMutation.isPending ? "animate-pulse" : ""}`}
              />
              Xuất Excel
            </button>
          )}

          {canExportBranch && (
            <button
              onClick={handleExportBranch}
              disabled={exportBranchMutation.isPending}
              className={`h-9 px-3 bg-white border border-adminGray-100 rounded-admin flex items-center gap-1.5 hover:bg-adminGray-50 transition-colors text-xs font-semibold text-adminInk ${
                exportBranchMutation.isPending ? "opacity-50" : ""
              }`}
              title="Xuất Excel doanh thu chi nhánh (KTV + dịch vụ)"
            >
              <Download
                className={`w-3.5 h-3.5 text-adminGray-400 ${exportBranchMutation.isPending ? "animate-pulse" : ""}`}
              />
              Xuất báo cáo CN
            </button>
          )}
        </div>
      </div>

      <RevenueKpiCards
        summary={summaryQuery.data?.data}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <TodayAppointmentsCard
          data={todayQuery.data?.data?.appointments}
          isLoading={todayQuery.isLoading}
        />
        <TodayCustomersCard
          data={todayQuery.data?.data?.customers}
          isLoading={todayQuery.isLoading}
        />
        <TodayCashSummaryCard
          data={todayQuery.data?.data?.cash}
          isLoading={todayQuery.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2">
          <CashFlowTrendChart
            data={trendQuery.data?.data}
            isLoading={isLoading}
          />
        </div>
        <div>
          <RevenueByItemTypeChart
            data={breakdownQuery.data?.data?.byItemType}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2">
          <CustomerTrafficChart salonId={selectedSalonId} from={from} to={to} />
        </div>
        <div>
          <NetRevenueBarChart salonId={selectedSalonId} from={from} to={to} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <TopStaffTable
          data={topStaffQuery.data?.data}
          isLoading={topStaffQuery.isLoading}
        />
        <TopRevenueItemsTable
          services={topServicesQuery.data?.data}
          products={topProductsQuery.data?.data}
          isLoading={topServicesQuery.isLoading || topProductsQuery.isLoading}
        />
      </div>
    </div>
  );
}
