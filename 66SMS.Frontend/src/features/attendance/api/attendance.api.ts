import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  AttendanceDto,
  CheckInPayload,
  CheckOutPayload,
  UpdateAttendancePayload,
  CreateManualAttendancePayload,
} from "../types/attendance.types";

export interface AttendanceListParams extends PageRequest {
  staffId?: number | null;
  salonId?: number | null;
  status?: number | null;
  fromDate?: string;
  toDate?: string;
}

export const attendanceApi = {
  getAll: (params: AttendanceListParams) =>
    axiosInstance
      .get<Result<PagedResult<AttendanceDto>>>(`/attendance/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<AttendanceDto>>(`/attendance/${id}`).then((r) => r.data),

  checkIn: (payload: CheckInPayload) =>
    axiosInstance.post<Result<number>>(`/attendance/check-in`, payload).then((r) => r.data),

  checkOut: (payload: CheckOutPayload) =>
    axiosInstance.post<Result<number>>(`/attendance/check-out`, payload).then((r) => r.data),

  update: (id: number, payload: UpdateAttendancePayload) =>
    axiosInstance.put<Result<number>>(`/attendance/${id}`, payload).then((r) => r.data),

  createManual: (payload: CreateManualAttendancePayload) =>
    axiosInstance.post<Result<number>>(`/attendance/manual`, payload).then((r) => r.data),
};
