import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/features/booking/api/booking.api";

const PAGE_SIZE = 5;

export function useCustomerAppointments(
  userId: number | null | undefined,
  pageIndex: number,
) {
  return useQuery({
    queryKey: ["customer-appointments", userId, pageIndex, PAGE_SIZE],
    queryFn: () => bookingApi.getByUserId(userId!, pageIndex, PAGE_SIZE),
    enabled: userId != null && userId > 0,
  });
}
