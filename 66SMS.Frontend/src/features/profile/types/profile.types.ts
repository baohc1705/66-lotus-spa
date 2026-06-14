import { type UserDto } from "@/features/users/types/user.types";

export type ProfileResponse = UserDto;

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  profilePhotoUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

