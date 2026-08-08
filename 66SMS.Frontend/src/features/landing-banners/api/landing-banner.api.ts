import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  LandingBannerDto,
  CreateLandingBannerPayload,
  UpdateLandingBannerPayload,
  LandingBannerQueryParams,
} from "../types/landing-banner.types";


export const landingBannerApi = {
  getPublic: () =>
    axiosInstance
      .get<Result<PagedResult<LandingBannerDto>>>("/landing-banners", {
        params: { pageSize: 50, orderBy: "sortorder" },
      })
      .then((r) => r.data),

  getAdminAll: (params: LandingBannerQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<LandingBannerDto>>>(`/landing-banners/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<LandingBannerDto>>(`/landing-banners/${id}`)
      .then((r) => r.data),

  create: (payload: CreateLandingBannerPayload) =>
    axiosInstance.post<Result<number>>("/landing-banners", payload).then((r) => r.data),

  update: (id: number, payload: UpdateLandingBannerPayload) =>
    axiosInstance
      .patch<Result<object>>(`/landing-banners/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/landing-banners/${id}`).then((r) => r.data),
};
