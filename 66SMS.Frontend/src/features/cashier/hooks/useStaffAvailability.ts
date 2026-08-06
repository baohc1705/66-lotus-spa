import { useQuery } from "@tanstack/react-query";
import { cashierApi } from "../api/cashier.api";

export function useStaffAvailability(
  open: boolean,
  date: Date,
  slotId: number | null,
  serviceId: number | null,
  salonId?: number | null,
) {
  return useQuery({
    queryKey: [
      "cashier-staff-availability",
      date.toDateString(),
      slotId,
      serviceId,
      salonId,
    ],
    queryFn: () =>
      cashierApi.getStaffAvailability(date, slotId!, serviceId!, salonId),
    enabled: open && slotId != null && serviceId != null && serviceId > 0,
    staleTime: 30_000,
  });
}
