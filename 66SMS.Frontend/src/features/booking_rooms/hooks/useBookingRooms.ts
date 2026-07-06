import { bookingRoomApi } from "@/features/booking_rooms/api/bookingRoom.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type {
  CreateBookingRoomPayload,
  UpdateBookingRoomPayload,
} from "../types/booking_room.types";

const ENTITY = "phòng dịch vụ";

const BOOKING_ROOM_KEYS = {
  all: ["booking-rooms"] as const,
  lists: () => [...BOOKING_ROOM_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...BOOKING_ROOM_KEYS.lists(), params] as const,
  details: () => [...BOOKING_ROOM_KEYS.all, "detail"] as const,
  detail: (id: number) => [...BOOKING_ROOM_KEYS.details(), id] as const,
};

export function useBookingRooms(params: PageRequest) {
  return useQuery({
    queryKey: BOOKING_ROOM_KEYS.list(params),
    queryFn: () => bookingRoomApi.getAll(params),
  });
}

export function useAdminBookingRooms(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: BOOKING_ROOM_KEYS.list(params),
    queryFn: () => bookingRoomApi.getAll(params),
    enabled,
  });
}

export function useBookingRoomDetail(id: number | null) {
  return useQuery({
    queryKey: BOOKING_ROOM_KEYS.detail(id!),
    queryFn: () => bookingRoomApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateBookingRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingRoomPayload) =>
      bookingRoomApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: BOOKING_ROOM_KEYS.lists() });
        toast.success(TOAST_MSG.createSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("tạo", ENTITY));
    },
  });
}

export function useUpdateBookingRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateBookingRoomPayload;
    }) => bookingRoomApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: BOOKING_ROOM_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("cập nhật", ENTITY));
    },
  });
}

export function useDeleteBookingRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingRoomApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: BOOKING_ROOM_KEYS.all });
        toast.success(TOAST_MSG.deleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("xóa", ENTITY));
    },
  });
}
