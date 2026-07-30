import { useQuery } from "@tanstack/react-query";
import { revenueApi } from "../api/revenue.api";

export function useReportByService(params: {
  from: string;
  to: string;
  salonId?: number | null;
  categoryId?: number | null;
}) {
  return useQuery({
    queryKey: ["revenue-report-service", params],
    queryFn: () => revenueApi.getReportByService(params),
  });
}
