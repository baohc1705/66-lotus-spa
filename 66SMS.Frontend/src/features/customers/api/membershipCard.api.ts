import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  MembershipCardDto,
  UpdateMembershipCardRequest,
  GetAllMembershipCardQuery,
  CreateMembershipCardRequest,
} from "../types/membershipCard.types";

export const membershipCardApi = {
  // Query API
  getAll: async (
    params: GetAllMembershipCardQuery,
  ): Promise<Result<PagedResult<MembershipCardDto>>> => {
    const response = await axiosInstance.get<
      Result<PagedResult<MembershipCardDto>>
    >("/membership-cards", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<MembershipCardDto>> => {
    const response = await axiosInstance.get<Result<MembershipCardDto>>(
      `/membership-cards/${id}`,
    );
    return response.data;
  },

  // Command API
  create: async (
    payload: CreateMembershipCardRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      `/membership-cards`,
      payload,
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: UpdateMembershipCardRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/membership-cards/${id}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/membership-cards/${id}`,
    );
    return response.data;
  },
};
