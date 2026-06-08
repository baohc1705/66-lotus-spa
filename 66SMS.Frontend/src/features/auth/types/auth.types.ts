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
