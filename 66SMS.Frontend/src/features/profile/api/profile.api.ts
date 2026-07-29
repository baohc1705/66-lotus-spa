import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result } from "@/shared/types/common.types";
import type { MembershipCardDto } from "@/features/customers/types/membershipCard.types";
import type {
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../types/profile.types";

export const profileApi = {
  getProfile: async () => {
    const { data } = await axiosInstance.get<Result<ProfileResponse>>(
      API.users.me,
    );
    return data;
  },

  updateProfile: async (body: UpdateProfileRequest) => {
    const { data } = await axiosInstance.put<Result<void>>(API.users.me, body);
    return data;
  },

  changePassword: async (body: ChangePasswordRequest) => {
    const { data } = await axiosInstance.post<Result<void>>(
      API.auth.changePassword,
      body,
    );
    return data;
  },

  getMyMembershipCard: async () => {
    const { data } = await axiosInstance.get<Result<MembershipCardDto>>(
      API.users.meMembershipCard,
    );
    return data;
  },
};
