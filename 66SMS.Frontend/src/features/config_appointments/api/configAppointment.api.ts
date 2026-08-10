import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateConfigAppointmentPayload,
  ConfigAppointmentDTO,
  UpdateConfigAppointmentPayload,
} from "../types/config_appointment.types";


export type ConfigAppointmentListParams = PageRequest & {
  salonId?: number;
};

export const configAppointmentApi = {
  getAll: (params: ConfigAppointmentListParams) =>
    axiosInstance
      .get<Result<PagedResult<ConfigAppointmentDTO>>>("/config-appointments", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ConfigAppointmentDTO>>(`/config-appointments/${id}`)
      .then((r) => r.data),

  getBySalon: (salonId: number) =>
    axiosInstance
      .get<Result<ConfigAppointmentDTO>>(`/config-appointments/by-salon/${salonId}`)
      .then((r) => r.data),

  create: (payload: CreateConfigAppointmentPayload) =>
    axiosInstance.post<Result<object>>("/config-appointments", payload).then((r) => r.data),

  update: (id: number, payload: UpdateConfigAppointmentPayload) =>
    axiosInstance
      .patch<Result<object>>(`/config-appointments/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/config-appointments/${id}`).then((r) => r.data),
};
