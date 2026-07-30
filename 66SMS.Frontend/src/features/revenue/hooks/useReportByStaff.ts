import { useQuery } from "@tanstack/react-query";
import { revenueApi } from "../api/revenue.api";

export function useReportByStaff(params: {
  from: string;
  to: string;
  salonId?: number | null;
}) {
  return useQuery({
    queryKey: ["revenue-report-staff", params],
    queryFn: () => revenueApi.getReportByStaff(params),
  });
}
