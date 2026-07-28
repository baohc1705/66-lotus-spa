import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { bookingApi } from "../api/booking.api";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type { Result } from "@/shared/types/common.types";
import type { SlotLockDto, CreateBookingPayload } from "../types/booking.types";

export const useTechnicians = (date: string | null, serviceId?: number, salonId?: number) => {
  return useQuery({
    queryKey: ["booking-technicians", date, serviceId, salonId],
    queryFn: () => bookingApi.getTechnicians(date as string, serviceId!, salonId),
    enabled: !!date && !!serviceId,
  });
};

export const useBookingPositions = () => {
  return useQuery({
    queryKey: ["booking-positions"],
    queryFn: bookingApi.getPositions,
  });
};

export const useTimeSlots = (
  date: string | null,
  serviceId?: number,
  technicianId?: number,
  salonId?: number
) => {
  return useQuery({
    queryKey: ["booking-timeslots", date, serviceId, technicianId, salonId],
    queryFn: () =>
      bookingApi.getTimeSlots(date as string, serviceId!, technicianId, salonId),
    enabled: !!date && !!serviceId,
  });
};

export const useCreateSlotLock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SlotLockDto[]) => bookingApi.createSlotLock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-timeslots"] });
      queryClient.invalidateQueries({ queryKey: ["booking-technicians"] });
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, "Không thể giữ khung giờ"));
      queryClient.invalidateQueries({ queryKey: ["booking-timeslots"] });
      queryClient.invalidateQueries({ queryKey: ["booking-technicians"] });
    }
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
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
