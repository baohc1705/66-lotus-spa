import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  MembershipTierDto,
  CreateMembershipTierRequest,
  UpdateMembershipTierRequest,
  GetAllMembershipTierQuery,
} from "../types/membershipTier.types";

export const membershipTierApi = {
  // Query API
  getAll: async (
    params: GetAllMembershipTierQuery,
  ): Promise<Result<PagedResult<MembershipTierDto>>> => {
    const response = await axiosInstance.get("/membership-tiers", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<MembershipTierDto>> => {
    const response = await axiosInstance.get(`/membership-tiers/${id}`);
    return response.data;
  },

  // Command API
  create: async (
    payload: CreateMembershipTierRequest,
  ): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      "/membership-tiers",
      payload,
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: UpdateMembershipTierRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/membership-tiers/${id}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/membership-tiers/${id}`,
    );
    return response.data;
  },
};
