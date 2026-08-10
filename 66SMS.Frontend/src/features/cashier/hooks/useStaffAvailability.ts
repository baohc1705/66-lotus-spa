import { useQuery } from "@tanstack/react-query";
import { cashierApi } from "../api/cashier.api";

export function useStaffAvailability(
  open: boolean,
  date: Date,
  startTime: string | null,
  serviceId: number | null,
  salonId?: number | null,
) {
  return useQuery({
    queryKey: [
      "cashier-staff-availability",
      date.toDateString(),
      startTime,
      serviceId,
      salonId,
    ],
    queryFn: () =>
      cashierApi.getStaffAvailability(date, startTime!, serviceId!, salonId),
    enabled:
      open &&
      !!startTime &&
      serviceId != null &&
      serviceId > 0,
    staleTime: 30_000,
  });
}
