import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../api/booking.api";
import type { GuestAppointmentDto, SlotLockDto } from "../types/booking.types";

export const useTechnicians = (date: string | null, serviceId?: number) => {
  return useQuery({
    queryKey: ["booking-technicians", date, serviceId],
    queryFn: () => bookingApi.getTechnicians(date as string, serviceId!),
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
  technicianId?: number
) => {
  return useQuery({
    queryKey: ["booking-timeslots", date, serviceId, technicianId],
    queryFn: () =>
      bookingApi.getTimeSlots(date as string, serviceId!, technicianId),
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
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-timeslots"] });
      queryClient.invalidateQueries({ queryKey: ["booking-technicians"] });
    }
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GuestAppointmentDto[]) =>
      bookingApi.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-timeslots"] });
      queryClient.invalidateQueries({ queryKey: ["booking-technicians"] });
    }
  });
};
