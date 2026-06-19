import axiosInstance from '@/shared/api/axiosInstance'
import { API } from '@/shared/api/endpoints'
import type { Result, PagedResult } from '@/shared/types/common.types'
import type { SalonDTO, CreateSalonPayload, UpdateSalonPayload, SalonQueryParams } from '../types/salon.types'

const BASE = API.salons

export const salonApi = {
  getAll: (params: SalonQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<SalonDTO>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<SalonDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateSalonPayload) =>
    axiosInstance.post<Result<number>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateSalonPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
}
