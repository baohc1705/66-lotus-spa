import axiosInstance from "@/shared/api/axiosInstance";
import type { Result } from "@/shared/types/common.types";
import type {
  RevenueQueryParams,
  RevenueSummaryDto,
  CashFlowTrendPointDto,
  RevenueBreakdownDto,
  TopRevenueItemDto,
  RecentTransactionDto,
  TodaySummaryDto,
  TrafficDataPointDto,
  NetRevenueDataPointDto,
  TopStaffDto,
} from "../types/revenue.types";

export const revenueApi = {
  getSummary: (
    params: RevenueQueryParams,
  ): Promise<Result<RevenueSummaryDto>> => {
    return axiosInstance
      .get<Result<RevenueSummaryDto>>("/admin/revenue/summary", { params })
      .then((r) => r.data);
  },

  getTrend: (
    params: RevenueQueryParams,
  ): Promise<Result<CashFlowTrendPointDto[]>> => {
    return axiosInstance
      .get<Result<CashFlowTrendPointDto[]>>("/admin/revenue/trend", { params })
      .then((r) => r.data);
  },

  getBreakdown: (
    params: RevenueQueryParams,
  ): Promise<Result<RevenueBreakdownDto>> => {
    return axiosInstance
      .get<Result<RevenueBreakdownDto>>("/admin/revenue/breakdown", { params })
      .then((r) => r.data);
  },

  getTopItems: (
    params: RevenueQueryParams,
    itemType: "service" | "product",
    limit: number = 5,
  ): Promise<Result<TopRevenueItemDto[]>> => {
    return axiosInstance
      .get<Result<TopRevenueItemDto[]>>(`/admin/revenue/top-items`, {
        params: { ...params, type: itemType, limit },
      })
      .then((r) => r.data);
  },

  getRecentTransactions: (
    params: RevenueQueryParams,
    limit: number = 10,
  ): Promise<Result<RecentTransactionDto[]>> => {
    return axiosInstance
      .get<Result<RecentTransactionDto[]>>(
        "/admin/revenue/recent-transactions",
        {
          params: { ...params, limit },
        },
      )
      .then((r) => r.data);
  },

  getTodaySummary: (
    salonId: number | null,
  ): Promise<Result<TodaySummaryDto>> => {
    return axiosInstance
      .get<
        Result<TodaySummaryDto>
      >("/admin/revenue/today", { params: { salonId } })
      .then((r) => r.data);
  },

  getCustomerTraffic: (
    salonId: number | null,
    tab: "hour" | "day" | "date",
    from: string,
    to: string,
  ): Promise<Result<TrafficDataPointDto[]>> => {
    return axiosInstance
      .get<Result<TrafficDataPointDto[]>>("/admin/revenue/customer-traffic", {
        params: { salonId, tab, from, to },
      })
      .then((r) => r.data);
  },

  getNetRevenue: (
    salonId: number | null,
    tab: "hour" | "day" | "date",
    from: string,
    to: string,
  ): Promise<Result<NetRevenueDataPointDto[]>> => {
    return axiosInstance
      .get<Result<NetRevenueDataPointDto[]>>("/admin/revenue/net-revenue", {
        params: { salonId, tab, from, to },
      })
      .then((r) => r.data);
  },

  getTopStaff: (
    salonId: number | null,
    from: string,
    to: string,
    limit: number = 5,
  ): Promise<Result<TopStaffDto[]>> => {
    return axiosInstance
      .get<Result<TopStaffDto[]>>("/admin/revenue/top-staff", {
        params: { salonId, from, to, limit },
      })
      .then((r) => r.data);
  },

  exportBySalon: (params: {
    from: string;
    to: string;
    comparePrevious?: boolean;
  }) => {
    return axiosInstance.get("/admin/revenue/export-by-salon", {
      params: {
        from: params.from,
        to: params.to,
        comparePrevious: params.comparePrevious ?? true,
      },
      responseType: "blob",
    });
  },

  exportBranch: (params: { from: string; to: string; salonId: number }) => {
    return axiosInstance.get("/admin/revenue/export-branch", {
      params: {
        from: params.from,
        to: params.to,
        salonId: params.salonId,
      },
      responseType: "blob",
    });
  },
};
