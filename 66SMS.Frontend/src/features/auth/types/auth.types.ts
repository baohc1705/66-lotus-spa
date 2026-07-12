export interface PermissionDTO {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
  permissionKey: string;
}

/** Profile gọn trả từ login/refresh (đồng bộ JWT claim profile). */
export interface TokenUserProfileDto {
  userId: number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  /** customer | staff | none */
  profileType: string;
  customerProfile?: TokenCustomerProfileDto | null;
  staffProfile?: TokenStaffProfileDto | null;
}

export interface TokenCustomerProfileDto {
  customerId: number;
  loyaltyPoint?: number | null;
}

export interface TokenStaffProfileDto {
  staffId: number;
  code?: string | null;
  salonId?: number | null;
}

export interface TokenResponseDTO {
  userId: number;
  accessToken: string;
  refreshToken: string;
  userProfile: TokenUserProfileDto;
}

export interface RoleDTO {
  id: number;
  name: string;
  desctiption: string;
  status: string;
  roleUsers?: RoleUserDTO[];
  rolePermissions?: RolePermissionDTO[];
}

export interface RoleUserDTO {
  id: number;
  username: string;
}

export interface RolePermissionDTO {
  id: number;
  permissionId: number;
  name: string;
}

// Request payloads
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface CreatePermissionRequest {
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface AssignPermissionsRequest {
  roleId: number;
  permissionIds: number[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  status: number;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}
