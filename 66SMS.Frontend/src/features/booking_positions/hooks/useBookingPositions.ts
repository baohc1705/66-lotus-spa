import type { AxiosError } from "axios";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { bookingPositionApi } from "@/features/booking_positions/api/bookingPosition.api";
import type { Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/kitToast";
import type {
  CreateBookingPositionPayload,
  UpdateBookingPositionPayload,
  BookingPositionListParams,
} from "../types/booking_position.types";

const ENTITY = "vị trí dịch vụ";

export const BOOKING_POSITION_KEYS =
  createEntityQueryKeys<BookingPositionListParams>("booking-positions");

export function useBookingPositions(params: BookingPositionListParams) {
  return useQuery({
    queryKey: BOOKING_POSITION_KEYS.list(params),
    queryFn: () => bookingPositionApi.getAll(params),
  });
}

export function useAdminBookingPositions(
  params: BookingPositionListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: BOOKING_POSITION_KEYS.adminList(params),
    queryFn: () => bookingPositionApi.getAll(params),
    enabled,
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
        qc.invalidateQueries({ queryKey: BOOKING_POSITION_KEYS.all });
        qc.invalidateQueries({ queryKey: ["booking-rooms"] });
        toast.success(`Tạo ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, `Có lỗi xảy ra khi tạo ${ENTITY}`));
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
        qc.invalidateQueries({ queryKey: ["booking-rooms"] });
        toast.success(`Cập nhật ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, `Có lỗi xảy ra khi cập nhật ${ENTITY}`),
      );
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
        qc.invalidateQueries({ queryKey: ["booking-rooms"] });
        toast.success(`Xóa ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, `Có lỗi xảy ra khi xóa ${ENTITY}`));
    },
  });
}
