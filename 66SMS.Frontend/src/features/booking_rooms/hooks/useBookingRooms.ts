import { bookingRoomApi } from "@/features/booking_rooms/api/bookingRoom.api";
import type {
  CreateBookingRoomRequest,
  GetAllBookingRoomQuery,
  UpdateBookingRoomRequest,
} from "@/features/booking_rooms/types/bookingRoom.types";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys cho phòng dịch vụ để dùng trong query cache
export const BOOKING_ROOM_QUERY_KEY =
  createEntityQueryKeys<GetAllBookingRoomQuery>("booking-rooms");

// Lấy danh sách phòng dịch vụ
export function useBookingRooms(
  params: GetAllBookingRoomQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: BOOKING_ROOM_QUERY_KEY.list(params),
    queryFn: () => bookingRoomApi.getAll(params),
    enabled,
  });
}

// Lấy chi tiết phòng dịch vụ
export function useBookingRoomDetail(id?: number | null) {
  return useQuery({
    queryKey: BOOKING_ROOM_QUERY_KEY.detail(id ?? 0),
    queryFn: () => bookingRoomApi.getDetail(id!),
    enabled: id != null && id > 0,
  });
}

// Tạo phòng dịch vụ
export function useCreateBookingRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingRoomRequest) => bookingRoomApi.create(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: BOOKING_ROOM_QUERY_KEY.all });
      showSuccess("Tạo phòng dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi tạo phòng dịch vụ"));
    },
  });
}

// Sửa phòng dịch vụ
export function useUpdateBookingRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookingRoomRequest }) =>
      bookingRoomApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: BOOKING_ROOM_QUERY_KEY.all });
      showSuccess("Sửa phòng dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi sửa phòng dịch vụ"));
    },
  });
}

// Xóa phòng dịch vụ
export function useDeleteBookingRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingRoomApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: BOOKING_ROOM_QUERY_KEY.all });
      queryClient.invalidateQueries({ queryKey: ["booking-positions"] });
      showSuccess("Xóa phòng dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa phòng dịch vụ"));
    },
  });
}
