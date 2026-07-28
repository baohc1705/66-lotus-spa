import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
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

const BASE = API.configAppointments;

export type ConfigAppointmentListParams = PageRequest & {
  salonId?: number;
};

export const configAppointmentApi = {
  getAll: (params: ConfigAppointmentListParams) =>
    axiosInstance
      .get<Result<PagedResult<ConfigAppointmentDTO>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ConfigAppointmentDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  getBySalon: (salonId: number) =>
    axiosInstance
      .get<Result<ConfigAppointmentDTO>>(`${BASE}/by-salon/${salonId}`)
      .then((r) => r.data),

  create: (payload: CreateConfigAppointmentPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateConfigAppointmentPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
