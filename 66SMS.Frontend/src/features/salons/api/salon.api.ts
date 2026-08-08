import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  SalonDTO,
  SalonListItem,
  CreateSalonPayload,
  UpdateSalonPayload,
  SalonQueryParams,
} from "../types/salon.types";


export const salonApi = {
  getAll: (params: SalonQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<SalonListItem>>>("/salons", { params })
      .then((r) => r.data),

  getAdminAll: (params: SalonQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<SalonListItem>>>(`/salons/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<SalonDTO>>(`/salons/${id}`).then((r) => r.data),

  getPrimary: () =>
    axiosInstance
      .get<Result<SalonDTO | null>>(`/salons/primary`)
      .then((r) => r.data),

  create: (payload: CreateSalonPayload) =>
    axiosInstance.post<Result<number>>("/salons", payload).then((r) => r.data),

  update: (id: number, payload: UpdateSalonPayload) =>
    axiosInstance
      .patch<Result<object>>(`/salons/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/salons/${id}`).then((r) => r.data),
};
