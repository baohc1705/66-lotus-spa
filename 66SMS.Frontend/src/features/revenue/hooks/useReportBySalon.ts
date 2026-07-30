import { useQuery } from "@tanstack/react-query";
import { revenueApi } from "../api/revenue.api";

export function useReportBySalon(params: { from: string; to: string }) {
  return useQuery({
    queryKey: ["revenue-report-salon", params],
    queryFn: () => revenueApi.getReportBySalon(params),
  });
}
