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
import {
  generateMockRevenueSummary,
  generateMockRevenueTrend,
  generateMockRevenueBreakdown,
  generateMockTopItems,
  generateMockRecentTransactions,
  generateMockTodaySummary,
  generateMockCustomerTraffic,
  generateMockNetRevenue,
  generateMockTopStaff,
} from "../data/revenue.mock";

const USE_MOCK = import.meta.env.VITE_USE_REVENUE_MOCK !== "false";

const wrapMock = <T>(data: T): Promise<Result<T>> => {
  return Promise.resolve({
    code: 200,
    message: "Success (Mocked)",
    data,
    isSuccess: true,
  });
};

export const revenueApi = {
  getSummary: (params: RevenueQueryParams): Promise<Result<RevenueSummaryDto>> => {
    if (USE_MOCK) return wrapMock(generateMockRevenueSummary(params));
    return axiosInstance.get<Result<RevenueSummaryDto>>("/admin/revenue/summary", { params }).then((r) => r.data);
  },

  getTrend: (params: RevenueQueryParams): Promise<Result<CashFlowTrendPointDto[]>> => {
    if (USE_MOCK) return wrapMock(generateMockRevenueTrend(params));
    return axiosInstance.get<Result<CashFlowTrendPointDto[]>>("/admin/revenue/trend", { params }).then((r) => r.data);
  },

  getBreakdown: (params: RevenueQueryParams): Promise<Result<RevenueBreakdownDto>> => {
    if (USE_MOCK) return wrapMock(generateMockRevenueBreakdown(params));
    return axiosInstance.get<Result<RevenueBreakdownDto>>("/admin/revenue/breakdown", { params }).then((r) => r.data);
  },

  getTopItems: (params: RevenueQueryParams, itemType: "service" | "product", limit: number = 5): Promise<Result<TopRevenueItemDto[]>> => {
    if (USE_MOCK) return wrapMock(generateMockTopItems(params, itemType, limit));
    return axiosInstance
      .get<Result<TopRevenueItemDto[]>>(`/admin/revenue/top-items`, { params: { ...params, type: itemType, limit } })
      .then((r) => r.data);
  },

  getRecentTransactions: (params: RevenueQueryParams, limit: number = 10): Promise<Result<RecentTransactionDto[]>> => {
    if (USE_MOCK) return wrapMock(generateMockRecentTransactions(params, limit));
    return axiosInstance
      .get<Result<RecentTransactionDto[]>>("/admin/revenue/recent-transactions", { params: { ...params, limit } })
      .then((r) => r.data);
  },

  getTodaySummary: (salonId: number | null): Promise<Result<TodaySummaryDto>> => {
    if (USE_MOCK) return wrapMock(generateMockTodaySummary(salonId));
    return axiosInstance.get<Result<TodaySummaryDto>>("/admin/revenue/today", { params: { salonId } }).then((r) => r.data);
  },

  getCustomerTraffic: (
    salonId: number | null,
    tab: "hour" | "day" | "date",
    from: string,
    to: string
  ): Promise<Result<TrafficDataPointDto[]>> => {
    if (USE_MOCK) return wrapMock(generateMockCustomerTraffic(salonId, tab, from, to));
    return axiosInstance
      .get<Result<TrafficDataPointDto[]>>("/admin/revenue/customer-traffic", { params: { salonId, tab, from, to } })
      .then((r) => r.data);
  },

  getNetRevenue: (
    salonId: number | null,
    tab: "hour" | "day" | "date",
    from: string,
    to: string
  ): Promise<Result<NetRevenueDataPointDto[]>> => {
    if (USE_MOCK) return wrapMock(generateMockNetRevenue(salonId, tab, from, to));
    return axiosInstance
      .get<Result<NetRevenueDataPointDto[]>>("/admin/revenue/net-revenue", { params: { salonId, tab, from, to } })
      .then((r) => r.data);
  },

  getTopStaff: (
    salonId: number | null,
    from: string,
    to: string,
    limit: number = 5
  ): Promise<Result<TopStaffDto[]>> => {
    if (USE_MOCK) return wrapMock(generateMockTopStaff(salonId, from, to, limit));
    return axiosInstance
      .get<Result<TopStaffDto[]>>("/admin/revenue/top-staff", { params: { salonId, from, to, limit } })
      .then((r) => r.data);
  },

  /** Xuất Excel so sánh chi nhánh (Admin). Trả AxiosResponse blob. */
  exportBySalon: (params: { from: string; to: string; comparePrevious?: boolean }) => {
    if (USE_MOCK) {
      return Promise.reject(new Error("Xuất Excel không khả dụng khi đang dùng dữ liệu giả (mock)."));
    }
    return axiosInstance.get("/admin/revenue/export-by-salon", {
      params: {
        from: params.from,
        to: params.to,
        comparePrevious: params.comparePrevious ?? true,
      },
      responseType: "blob",
    });
  },
};

