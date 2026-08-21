import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  ConfigAppointmentDTO,
  CreateConfigAppointmentRequest,
  UpdateConfigAppointmentRequest,
  GetAllConfigAppointmentQuery,
} from "../types/configAppointment.types";

export const configAppointmentApi = {
  // Query API
  getAll: async (
    params: GetAllConfigAppointmentQuery,
  ): Promise<Result<PagedResult<ConfigAppointmentDTO>>> => {
    const response = await axiosInstance.get<
      Result<PagedResult<ConfigAppointmentDTO>>
    >("/config-appointments", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<ConfigAppointmentDTO>> => {
    const response = await axiosInstance.get<Result<ConfigAppointmentDTO>>(
      `/config-appointments/${id}`,
    );
    return response.data;
  },

  getBySalon: async (
    salonId: number,
  ): Promise<Result<ConfigAppointmentDTO>> => {
    const response = await axiosInstance.get<Result<ConfigAppointmentDTO>>(
      `/config-appointments/by-salon/${salonId}`,
    );
    return response.data;
  },

  // Command API
  create: async (
    payload: CreateConfigAppointmentRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      "/config-appointments",
      payload,
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: UpdateConfigAppointmentRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/config-appointments/${id}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/config-appointments/${id}`,
    );
    return response.data;
  },
};
