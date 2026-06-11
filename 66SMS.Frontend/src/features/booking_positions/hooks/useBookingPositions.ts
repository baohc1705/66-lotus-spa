import { bookingPositionApi } from "@/features/booking_positions/api/bookingPosition.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateBookingPositionPayload,
  UpdateBookingPositionPayload,
} from "../types/booking_position.types";

const BOOKING_POSITION_KEYS = {
  all: ["booking-positions"] as const,
  lists: () => [...BOOKING_POSITION_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...BOOKING_POSITION_KEYS.lists(), params] as const,
  details: () => [...BOOKING_POSITION_KEYS.all, "detail"] as const,
  detail: (id: number) => [...BOOKING_POSITION_KEYS.details(), id] as const,
};

export function useBookingPositions(params: PageRequest) {
  return useQuery({
    queryKey: BOOKING_POSITION_KEYS.list(params),
    queryFn: () => bookingPositionApi.getAll(params),
  });
}

export function useBookingPositionDetail(id: number | null) {
  return useQuery({
    queryKey: BOOKING_POSITION_KEYS.detail(id!),
    queryFn: () => bookingPositionApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateBookingPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPositionPayload) =>
      bookingPositionApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: BOOKING_POSITION_KEYS.lists() });
        toast.success("Tạo thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi tạo vị trí dịch vụ");
    },
  });
}

export function useUpdateBookingPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateBookingPositionPayload;
    }) => bookingPositionApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: BOOKING_POSITION_KEYS.all });
        toast.success("Cập nhật thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật vị trí dịch vụ");
    },
  });
}

export function useDeleteBookingPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingPositionApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: BOOKING_POSITION_KEYS.all });
        toast.success("Xóa thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa vị trí dịch vụ");
    },
  });
}
