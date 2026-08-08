import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  MembershipTierDto,
  CreateMembershipTierPayload,
  UpdateMembershipTierPayload,
  MembershipTierQueryParams,
} from "../types/membershipTier.types";


export const membershipTierApi = {
  getAll: (params: MembershipTierQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<MembershipTierDto>>>("/membership-tiers", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<MembershipTierDto>>(`/membership-tiers/${id}`)
      .then((r) => r.data),

  create: (payload: CreateMembershipTierPayload) =>
    axiosInstance.post<Result<number>>("/membership-tiers", payload).then((r) => r.data),

  update: (id: number, payload: UpdateMembershipTierPayload) =>
    axiosInstance
      .patch<Result<object>>(`/membership-tiers/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/membership-tiers/${id}`).then((r) => r.data),
};
