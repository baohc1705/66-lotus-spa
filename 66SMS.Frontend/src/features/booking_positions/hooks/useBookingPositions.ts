import { bookingPositionApi } from "@/features/booking_positions/api/bookingPosition.api";
import type {
  CreateBookingPositionRequest,
  GetAllBookingPositionQuery,
  UpdateBookingPositionRequest,
} from "@/features/booking_positions/types/bookingPosition.types";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys cho vị trí dịch vụ để dùng trong query cache
export const BOOKING_POSITION_QUERY_KEY =
  createEntityQueryKeys<GetAllBookingPositionQuery>("booking-positions");

// Lấy danh sách vị trí dịch vụ
export function useBookingPositions(
  params: GetAllBookingPositionQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: BOOKING_POSITION_QUERY_KEY.list(params),
    queryFn: () => bookingPositionApi.getAll(params),
    enabled,
  });
}

// Lấy chi tiết vị trí dịch vụ
export function useBookingPositionDetail(id?: number | null) {
  return useQuery({
    queryKey: BOOKING_POSITION_QUERY_KEY.detail(id ?? 0),
    queryFn: () => bookingPositionApi.getDetail(id!),
    enabled: id != null && id > 0,
  });
}

// Tạo vị trí dịch vụ
export function useCreateBookingPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingPositionRequest) =>
      bookingPositionApi.create(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: BOOKING_POSITION_QUERY_KEY.all,
      });
      queryClient.invalidateQueries({ queryKey: ["booking-rooms"] });
      showSuccess("Tạo vị trí dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi tạo vị trí dịch vụ"));
    },
  });
}

// Sửa vị trí dịch vụ
export function useUpdateBookingPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateBookingPositionRequest;
    }) => bookingPositionApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: BOOKING_POSITION_QUERY_KEY.all,
      });
      queryClient.invalidateQueries({ queryKey: ["booking-rooms"] });
      showSuccess("Sửa vị trí dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi sửa vị trí dịch vụ"));
    },
  });
}

// Xóa vị trí dịch vụ
export function useDeleteBookingPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingPositionApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: BOOKING_POSITION_QUERY_KEY.all,
      });
      queryClient.invalidateQueries({ queryKey: ["booking-rooms"] });
      showSuccess("Xóa vị trí dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa vị trí dịch vụ"));
    },
  });
}
