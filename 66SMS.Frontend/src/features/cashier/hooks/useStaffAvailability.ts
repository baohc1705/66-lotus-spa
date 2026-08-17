import { useQuery } from "@tanstack/react-query";
import { cashierApi } from "../api/cashier.api";
import { CASHIER_STAFF_AVAILABILITY } from "../cashierQueryKey";

export function useStaffAvailability(
  open: boolean,
  date: Date,
  startTime: string | null,
  serviceId: number | null,
  salonId?: number | null,
) {
  return useQuery({
    queryKey: [
      CASHIER_STAFF_AVAILABILITY,
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
