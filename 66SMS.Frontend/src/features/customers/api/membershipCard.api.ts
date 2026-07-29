import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  MembershipCardDto,
  UpdateMembershipCardPayload,
  MembershipCardQueryParams,
} from "../types/membershipCard.types";

const BASE = API.membershipCards;

export const membershipCardApi = {
  getAll: (params: MembershipCardQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<MembershipCardDto>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<MembershipCardDto>>(`${BASE}/${id}`)
      .then((r) => r.data),

  update: (id: number, payload: UpdateMembershipCardPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),
};
