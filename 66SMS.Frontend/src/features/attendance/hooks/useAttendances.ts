import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { toast } from "@/shared/components/kitToast";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";

import { attendanceApi, type AttendanceListParams } from "../api/attendance.api";
import type {
  CheckInPayload,
  CheckOutPayload,
  CreateManualAttendancePayload,
  UpdateAttendancePayload,
} from "../types/attendance.types";

const ATTENDANCE_KEYS = {
  all: ["attendances"] as const,
  lists: () => [...ATTENDANCE_KEYS.all, "list"] as const,
  list: (params: AttendanceListParams) =>
    [...ATTENDANCE_KEYS.lists(), params] as const,
};

export function useAttendances(params: AttendanceListParams) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.list(params),
    queryFn: () => attendanceApi.getAll(params),
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckInPayload) => attendanceApi.checkIn(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
        toast.success("Check-in thành công");
      } else {
        toast.error(result.message || "Không thể check-in");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, "Không thể check-in"));
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckOutPayload) => attendanceApi.checkOut(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
        toast.success("Check-out thành công");
      } else {
        toast.error(result.message || "Không thể check-out");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, "Không thể check-out"));
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: number; payload: UpdateAttendancePayload }) =>
      attendanceApi.update(input.id, input.payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
        toast.success("Cập nhật chấm công thành công");
      } else {
        toast.error(result.message || "Không thể cập nhật");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateManualAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateManualAttendancePayload) =>
      attendanceApi.createManual(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
        toast.success("Tạo bản ghi chấm công thành công");
      } else {
        toast.error(result.message || "Không thể tạo bản ghi");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error));
    },
  });
}
