import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateServicePayload,
  ServiceDTO,
  UpdateServicePayload,
} from "../types/service.types";

const BASE = "/Service";

export const serviceApi = {
  // Get All
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceDTO>>>(BASE, { params })
      .then((r) => r.data),
  // Get Detail
  getDetail: (id: number) =>
    axiosInstance.get<Result<ServiceDTO>>(`${BASE}/${id}`).then((r) => r.data),

  // Create Service
  create: (payload: CreateServicePayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  // Update Service
  update: (id: number, payload: UpdateServicePayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  // Delete Service
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  // User get all service
  getAllServicesUsers: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceDTO>>>(`${BASE}/users`, { params })
      .then((r) => r.data),
};
