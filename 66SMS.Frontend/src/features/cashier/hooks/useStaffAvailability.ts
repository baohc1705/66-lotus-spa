import { useQuery } from "@tanstack/react-query";
import { cashierApi } from "../api/cashier.api";
import { CASHIER_STAFF_AVAILABILITY } from "../cashierQueryKey";

export function useStaffAvailability(
  open: boolean,
  date: Date,
  startTime: string | null,
  serviceIds: number[] | null,
  salonId?: number | null,
) {
  const ids = serviceIds ?? [];
  const serviceKey = ids.join(",");

  return useQuery({
    queryKey: [
      CASHIER_STAFF_AVAILABILITY,
      date.toDateString(),
      startTime,
      serviceKey,
      salonId,
    ],
    queryFn: () =>
      cashierApi.getStaffAvailability(date, startTime!, ids, salonId),
    enabled: open && !!startTime && ids.length > 0,
    staleTime: 30_000,
  });
}
