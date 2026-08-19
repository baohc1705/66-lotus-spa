import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  AttendanceDto,
  CheckInRequest,
  CheckOutRequest,
  UpdateAttendanceRequest,
  CreateManualAttendanceRequest,
  GetAllAttendancesQuery,
} from "@/features/attendance/types/attendance.types";

export const attendanceApi = {
  // Query API
  getAll: async (
    params: GetAllAttendancesQuery,
  ): Promise<Result<PagedResult<AttendanceDto>>> => {
    const response = await axiosInstance.get<
      Result<PagedResult<AttendanceDto>>
    >(`/attendance/admin`, { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<AttendanceDto>> => {
    const response = await axiosInstance.get<Result<AttendanceDto>>(
      `/attendance/${id}`,
    );
    return response.data;
  },

  // Command API

  checkIn: async (payload: CheckInRequest): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      `/attendance/check-in`,
      payload,
    );
    return response.data;
  },

  checkOut: async (payload: CheckOutRequest): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      `/attendance/check-out`,
      payload,
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: UpdateAttendanceRequest,
  ): Promise<Result<number>> => {
    const response = await axiosInstance.put<Result<number>>(
      `/attendance/${id}`,
      payload,
    );
    return response.data;
  },

  createManual: async (
    payload: CreateManualAttendanceRequest,
  ): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      `/attendance/manual`,
      payload,
    );
    return response.data;
  },
};
