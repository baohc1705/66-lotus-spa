import { useQuery } from "@tanstack/react-query";
import type { RevenueReportGrain } from "../types/revenue.types";
import { revenueApi } from "../api/revenue.api";

export function useReportByPeriod(params: {
  from: string;
  to: string;
  salonId?: number | null;
  grain: RevenueReportGrain;
}) {
  return useQuery({
    queryKey: ["revenue-report-period", params],
    queryFn: () => revenueApi.getReportByPeriod(params),
  });
}
