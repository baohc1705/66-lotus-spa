import axiosInstance from '@/shared/api/axiosInstance'
import { API } from '@/shared/api/endpoints'
import type { Result, PagedResult, PageRequest } from '@/shared/types/common.types'
import type { PromotionDto, CreatePromotionPayload, UpdatePromotionPayload } from '../types/promotion.types'

const BASE = API.promotions

export const promotionApi = {
  getAll: (params: PageRequest) =>
    axiosInstance.get<Result<PagedResult<PromotionDto>>>(BASE, { params }).then(r => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<PromotionDto>>(`${BASE}/${id}`).then(r => r.data),

  create: (payload: CreatePromotionPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then(r => r.data),

  update: (id: number, payload: UpdatePromotionPayload) =>
    axiosInstance.patch<Result<object>>(`${BASE}/${id}`, payload).then(r => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then(r => r.data),
}
