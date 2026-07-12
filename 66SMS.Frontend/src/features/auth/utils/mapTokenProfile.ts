import type { UserDto } from '@/features/users/types/user.types';
import type { TokenResponseDTO, TokenUserProfileDto } from '@/features/auth/types/auth.types';

/** Map profile từ login/refresh → UserDto dùng trong authStore / UI. */
export function mapTokenProfileToUser(profile: TokenUserProfileDto): UserDto {
  return {
    id: profile.userId,
    username: profile.username,
    email: profile.email,
    isEmailConfirmed: true,
    status: 'active',
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    phone: profile.phone,
    roles: profile.roles ?? [],
    permissions: profile.permissions ?? [],
    profileType: profile.profileType,
    customerInfo: profile.customerProfile
      ? {
          id: profile.customerProfile.customerId,
          loyaltyPoint: profile.customerProfile.loyaltyPoint ?? undefined,
        }
      : undefined,
    staffInfo: profile.staffProfile
      ? {
          id: profile.staffProfile.staffId,
          code: profile.staffProfile.code ?? undefined,
        }
      : undefined,
  };
}

export function getSalonIdFromProfile(profile: TokenUserProfileDto | null | undefined): number | null {
  const salonId = profile?.staffProfile?.salonId;
  return salonId && salonId > 0 ? salonId : null;
}

export function applyTokenResponse(data: TokenResponseDTO) {
  return {
    accessToken: data.accessToken,
    user: mapTokenProfileToUser(data.userProfile),
    managedSalonId: getSalonIdFromProfile(data.userProfile),
  };
}
