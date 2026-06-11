import { bookingRoomApi } from "@/features/booking_rooms/api/bookingRoom.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateBookingRoomPayload,
  UpdateBookingRoomPayload,
} from "../types/booking_room.types";

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
        toast.success("Tạo thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi tạo phòng dịch vụ");
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
        toast.success("Cập nhật thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật phòng dịch vụ");
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
        toast.success("Xóa thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa phòng dịch vụ");
    },
  });
}
