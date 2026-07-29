import { useQuery } from "@tanstack/react-query";
import { revenueApi } from "../api/revenue.api";
import type { RevenueQueryParams } from "../types/revenue.types";

export function useRevenueSummary(params: RevenueQueryParams) {
  return useQuery({
    queryKey: ["revenue", "summary", params],
    queryFn: () => revenueApi.getSummary(params),
  });
}

export function useRevenueTrend(params: RevenueQueryParams) {
  return useQuery({
    queryKey: ["revenue", "trend", params],
    queryFn: () => revenueApi.getTrend(params),
  });
}

export function useRevenueBreakdown(params: RevenueQueryParams) {
  return useQuery({
    queryKey: ["revenue", "breakdown", params],
    queryFn: () => revenueApi.getBreakdown(params),
  });
}

export function useTopRevenueItems(
  params: RevenueQueryParams, 
  itemType: "service" | "product",
  limit: number = 5,
) {
  return useQuery({
    queryKey: ["revenue", "top-items", itemType, params, limit],
    queryFn: () => revenueApi.getTopItems(params, itemType, limit),
  });
}

export function useRecentTransactions(
  params: RevenueQueryParams,
  limit: number = 10,
) {
  return useQuery({
    queryKey: ["revenue", "recent-transactions", params, limit],
    queryFn: () => revenueApi.getRecentTransactions(params, limit),
  });
}

export function useTodaySummary(salonId: number | null) {
  return useQuery({
    queryKey: ["revenue", "today", salonId],
    queryFn: () => revenueApi.getTodaySummary(salonId),
  });
}

export function useCustomerTraffic(
  salonId: number | null,
  tab: "hour" | "day" | "date",
  from: string,
  to: string,
) {
  return useQuery({
    queryKey: ["revenue", "customer-traffic", salonId, tab, from, to],
    queryFn: () => revenueApi.getCustomerTraffic(salonId, tab, from, to),
  });
}

export function useNetRevenue(
  salonId: number | null,
  tab: "hour" | "day" | "date",
  from: string,
  to: string,
) {
  return useQuery({
    queryKey: ["revenue", "net-revenue", salonId, tab, from, to],
    queryFn: () => revenueApi.getNetRevenue(salonId, tab, from, to),
  });
}

export function useTopStaff(
  salonId: number | null,
  from: string,
  to: string,
  limit: number = 5,
) {
  return useQuery({
    queryKey: ["revenue", "top-staff", salonId, from, to, limit],
    queryFn: () => revenueApi.getTopStaff(salonId, from, to, limit),
  });
}
