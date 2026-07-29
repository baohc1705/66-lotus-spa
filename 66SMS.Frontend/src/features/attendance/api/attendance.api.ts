import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
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

const BASE = API.attendances;

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
      .get<Result<PagedResult<AttendanceDto>>>(`${BASE}/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<AttendanceDto>>(`${BASE}/${id}`).then((r) => r.data),

  checkIn: (payload: CheckInPayload) =>
    axiosInstance.post<Result<number>>(`${BASE}/check-in`, payload).then((r) => r.data),

  checkOut: (payload: CheckOutPayload) =>
    axiosInstance.post<Result<number>>(`${BASE}/check-out`, payload).then((r) => r.data),

  update: (id: number, payload: UpdateAttendancePayload) =>
    axiosInstance.put<Result<number>>(`${BASE}/${id}`, payload).then((r) => r.data),

  createManual: (payload: CreateManualAttendancePayload) =>
    axiosInstance.post<Result<number>>(`${BASE}/manual`, payload).then((r) => r.data),
};
