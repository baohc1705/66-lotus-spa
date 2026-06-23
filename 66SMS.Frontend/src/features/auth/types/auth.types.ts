export interface PermissionDTO {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
  permissionKey: string;
}

export interface TokenResponseDTO {
  userId: number;
  accessToken: string;
  refreshToken: string;
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

export interface RegisterResponseDto {
  userId: number;
  customerId: number;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}
