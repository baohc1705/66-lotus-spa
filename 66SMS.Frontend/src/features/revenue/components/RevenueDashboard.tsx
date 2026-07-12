import { useMemo } from "react";
import { RefreshCw, CalendarRange } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

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

export function RevenueDashboard() {
  const queryClient = useQueryClient();
  const selectedSalonId = useAuthStore((state) => state.selectedSalonId);
  const { preset, from, to, setPreset } = useRevenueFilters();

  const queryParams = useMemo(
    () => ({
      from,
      to,
      salonId: selectedSalonId,
      comparePrevious: true,
    }),
    [from, to, selectedSalonId],
  );

  // Fetch Dashboard Data
  const summaryQuery = useRevenueSummary(queryParams);
  const trendQuery = useRevenueTrend(queryParams);
  const breakdownQuery = useRevenueBreakdown(queryParams);
  const topServicesQuery = useTopRevenueItems(queryParams, "service", 5);
  const topProductsQuery = useTopRevenueItems(queryParams, "product", 5);
  const todayQuery = useTodaySummary(selectedSalonId);
  const topStaffQuery = useTopStaff(selectedSalonId, 5);

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

  return (
    <div className="space-y-2 pb-10">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 bg-white border border-adminGray-100 rounded-admin h-9 px-3">
            <CalendarRange className="w-3.5 h-3.5 text-adminGray-400" />
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as RevenuePreset)}
              className="text-xs text-adminInk font-semibold bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="thisMonth">Tháng này</option>
            </select>
          </div>

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
        </div>
      </div>

      {/* ─── Row 1: 6 KPI Cards ─────────────────────────────────────────── */}
      <RevenueKpiCards
        summary={summaryQuery.data?.data}
        isLoading={isLoading}
      />

      {/* ─── Row 2: Today Summary (3 compact panels) ────────────────────── */}
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

      {/* ─── Row 3: Cash Flow Trend (2/3) + Revenue Structure (1/3) ─────── */}
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

      {/* ─── Row 4: Customer Traffic (2/3) + Net Revenue (1/3) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2">
          <CustomerTrafficChart salonId={selectedSalonId} from={from} to={to} />
        </div>
        <div>
          <NetRevenueBarChart salonId={selectedSalonId} from={from} to={to} />
        </div>
      </div>

      {/* ─── Row 5: Top Staff (1/2) + Top Items (1/2) ───────────────────── */}
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
