import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";

import { attendanceApi } from "@/features/attendance/api/attendance.api";
import type {
  CheckInRequest,
  CheckOutRequest,
  CreateManualAttendanceRequest,
  GetAllAttendancesQuery,
  UpdateAttendanceRequest,
} from "@/features/attendance/types/attendance.types";

export const ATTENDANCE_QUERY_KEY =
  createEntityQueryKeys<GetAllAttendancesQuery>("attendances");

// Lấy danh sách chấm công
export function useAttendances(params: GetAllAttendancesQuery, enabled = true) {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEY.list(params),
    queryFn: () => attendanceApi.getAll(params),
    enabled,
  });
}

// Lấy chi tiết chấm công
export function useAttendanceDetail(id: number, enabled = true) {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEY.detail(id),
    queryFn: () => attendanceApi.getDetail(id),
    enabled,
  });
}

// Check-in chấm công
export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckInRequest) => attendanceApi.checkIn(payload),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Không thể check-in");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY.all });
      showSuccess("Check-in thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Không thể check-in"));
    },
  });
}

// Check-out chấm công
export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckOutRequest) => attendanceApi.checkOut(payload),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Không thể check-out");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY.all });
      showSuccess("Check-out thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Không thể check-out"));
    },
  });
}

// Cập nhật chấm công
export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateAttendanceRequest;
    }) => attendanceApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Không thể cập nhật chấm công");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY.all });
      showSuccess("Cập nhật chấm công thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Không thể cập nhật chấm công"));
    },
  });
}

// Tạo chấm công thủ công (nghỉ phép)
export function useCreateManualAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateManualAttendanceRequest) =>
      attendanceApi.createManual(payload),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Không thể tạo chấm công");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY.all });
      showSuccess("Tạo chấm công thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Không thể tạo chấm công"));
    },
  });
}
