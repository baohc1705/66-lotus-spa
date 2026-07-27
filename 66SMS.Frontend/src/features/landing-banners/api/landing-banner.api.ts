import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  LandingBannerDto,
  CreateLandingBannerPayload,
  UpdateLandingBannerPayload,
  LandingBannerQueryParams,
} from "../types/landing-banner.types";

const BASE = API.landingBanners;

export const landingBannerApi = {
  getPublic: () =>
    axiosInstance
      .get<Result<PagedResult<LandingBannerDto>>>(BASE, {
        params: { pageSize: 50, orderBy: "sortorder" },
      })
      .then((r) => r.data),

  getAdminAll: (params: LandingBannerQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<LandingBannerDto>>>(`${BASE}/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<LandingBannerDto>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateLandingBannerPayload) =>
    axiosInstance.post<Result<number>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateLandingBannerPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
