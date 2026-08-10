import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  MembershipCardDto,
  UpdateMembershipCardPayload,
  MembershipCardQueryParams,
} from "../types/membershipCard.types";


export const membershipCardApi = {
  getAll: (params: MembershipCardQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<MembershipCardDto>>>("/membership-cards", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<MembershipCardDto>>(`/membership-cards/${id}`)
      .then((r) => r.data),

  update: (id: number, payload: UpdateMembershipCardPayload) =>
    axiosInstance
      .patch<Result<object>>(`/membership-cards/${id}`, payload)
      .then((r) => r.data),
};
