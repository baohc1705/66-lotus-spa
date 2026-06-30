import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { attendanceApi, type AttendanceListParams } from "../api/attendance.api";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type { Result } from "@/shared/types/common.types";
import type {
  CheckInPayload,
  CheckOutPayload,
  UpdateAttendancePayload,
  CreateManualAttendancePayload,
} from "../types/attendance.types";

const ATTENDANCE_KEYS = {
  all: ["attendances"] as const,
  lists: () => [...ATTENDANCE_KEYS.all, "list"] as const,
  list: (params: AttendanceListParams) => [...ATTENDANCE_KEYS.lists(), params] as const,
};

// Danh sách chấm công
export function useAttendances(params: AttendanceListParams) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.list(params),
    queryFn: () => attendanceApi.getAll(params),
  });
}

// Check-in
export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckInPayload) => attendanceApi.checkIn(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
        toast.success("Check-in thành công");
      } else {
        toast.error(result.message || "Không thể check-in");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

// Check-out
export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckOutPayload) => attendanceApi.checkOut(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
        toast.success("Check-out thành công");
      } else {
        toast.error(result.message || "Không thể check-out");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

// Sửa giờ tay
export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAttendancePayload }) =>
      attendanceApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
        toast.success("Cập nhật chấm công thành công");
      } else {
        toast.error(result.message || "Không thể cập nhật");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

// Tạo bản ghi nghỉ phép/lễ/vắng
export function useCreateManualAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateManualAttendancePayload) => attendanceApi.createManual(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
        toast.success("Tạo bản ghi chấm công thành công");
      } else {
        toast.error(result.message || "Không thể tạo bản ghi");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}
