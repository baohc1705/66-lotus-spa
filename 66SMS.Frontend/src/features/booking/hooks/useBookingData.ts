import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { bookingApi } from "../api/booking.api";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type { Result } from "@/shared/types/common.types";
import type {
  CreateAppointmentPayload,
  CreateSlotLockPayload,
  GetTechniciansParams,
  GetTimeSlotsParams,
} from "../types/booking.types";

export const useAvailableBookingDays = (days = 7) => {
  return useQuery({
    queryKey: ["booking-available-days", days],
    queryFn: () => bookingApi.getAvailableDays({ days }),
  });
};

export const useActivePromotions = () => {
  return useQuery({
    queryKey: ["booking-active-promotions"],
    queryFn: () => bookingApi.getActivePromotions(),
    staleTime: 60_000,
  });
};

export const useTechnicians = (params: GetTechniciansParams) => {
  return useQuery({
    queryKey: [
      "booking-technicians",
      params.date,
      params.serviceId,
      params.salonId,
    ],
    queryFn: () => bookingApi.getTechnicians(params),
    enabled: !!params.date && !!params.serviceId,
  });
};

export const useBookingPositions = () => {
  return useQuery({
    queryKey: ["booking-positions"],
    queryFn: bookingApi.getPositions,
  });
};

export const useTimeSlots = (params: GetTimeSlotsParams) => {
  return useQuery({
    queryKey: [
      "booking-timeslots",
      params.date,
      params.serviceId,
      params.staffId,
      params.salonId,
    ],
    queryFn: () => bookingApi.getTimeSlots(params),
    enabled: !!params.date && !!params.serviceId,
  });
};

export const useCreateSlotLock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSlotLockPayload) =>
      bookingApi.createSlotLock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-timeslots"] });
      queryClient.invalidateQueries({ queryKey: ["booking-technicians"] });
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, "Không thể giữ khung giờ"));
      queryClient.invalidateQueries({ queryKey: ["booking-timeslots"] });
      queryClient.invalidateQueries({ queryKey: ["booking-technicians"] });
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      bookingApi.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-timeslots"] });
      queryClient.invalidateQueries({ queryKey: ["booking-technicians"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, "Đặt lịch thất bại"));
    },
  });
};
