import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/utils/kitToast";
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

function hasServiceSelection(params: {
  serviceId?: number;
  serviceIds?: number[];
}) {
  if (params.serviceIds && params.serviceIds.length > 0) return true;
  return !!params.serviceId;
}

function serviceKey(params: { serviceId?: number; serviceIds?: number[] }) {
  if (params.serviceIds && params.serviceIds.length > 0) {
    return params.serviceIds.join(",");
  }
  return params.serviceId ?? "";
}

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
      serviceKey(params),
      params.salonId,
    ],
    queryFn: () => bookingApi.getTechnicians(params),
    enabled: !!params.date && hasServiceSelection(params),
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
      serviceKey(params),
      params.staffId,
      params.salonId,
    ],
    queryFn: () => bookingApi.getTimeSlots(params),
    enabled: !!params.date && hasServiceSelection(params),
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
      toast.error(getErrorMessage(error, "Thời lượng dịch vụ vượt quá khung giờ còn lại. Vui lòng chọn giờ sớm hơn."));
      queryClient.invalidateQueries({ queryKey: ["booking-timeslots"] });
      queryClient.invalidateQueries({ queryKey: ["booking-technicians"] });
    },
  });
};

export const useReleaseSlotLock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lockIds: number[]) => bookingApi.releaseSlotLock(lockIds),
    onSuccess: () => {
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
