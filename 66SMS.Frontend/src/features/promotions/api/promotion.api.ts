import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  PromotionDto,
  CreatePromotionPayload,
  UpdatePromotionPayload,
} from "../types/promotion.types";

export const promotionApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<PromotionDto>>>("/promotions", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<PromotionDto>>(`/promotions/${id}`)
      .then((r) => r.data),

  create: (payload: CreatePromotionPayload) =>
    axiosInstance.post<Result<object>>("/promotions", payload).then((r) => r.data),

  update: (id: number, payload: UpdatePromotionPayload) =>
    axiosInstance
      .patch<Result<object>>(`/promotions/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/promotions/${id}`).then((r) => r.data),
};
