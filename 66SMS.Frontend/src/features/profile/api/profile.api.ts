import axiosInstance from "@/shared/api/axiosInstance";
import type { Result } from "@/shared/types/common.types";
import type {
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../types/profile.types";

export const profileApi = {
  getProfile: async () => {
    const { data } =
      await axiosInstance.get<Result<ProfileResponse>>("/users/me");
    return data;
  },

  updateProfile: async (body: UpdateProfileRequest) => {
    const { data } = await axiosInstance.put<Result<void>>("/users/me", body);
    return data;
  },

  changePassword: async (body: ChangePasswordRequest) => {
    const { data } = await axiosInstance.post<Result<void>>(
      "/auth/change-password",
      body,
    );
    return data;
  },
};
