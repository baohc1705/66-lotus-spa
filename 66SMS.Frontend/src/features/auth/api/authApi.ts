import axiosInstance from '@/shared/api/axiosInstance';
import type { Result, PagedResult } from '@/shared/types/common.types';
import type {
  TokenResponseDTO,
  RoleDTO,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  CreateRoleRequest,
  CreatePermissionRequest,
  AssignPermissionsRequest,
} from '@/shared/types/auth.types';
import type { CreateUserRequest } from '@/shared/types/user.types';

const AUTH = '/auth';

export const authApi = {
  login: (body: LoginRequest) =>
    axiosInstance.post<Result<TokenResponseDTO>>(`${AUTH}/login`, body),

  logout: () =>
    axiosInstance.post<Result<object>>(`${AUTH}/logout`),

  refreshToken: (token: string) =>
    axiosInstance.post<Result<TokenResponseDTO>>(`${AUTH}/refresh-token`, { token }),

  register: (body: CreateUserRequest) =>
    axiosInstance.post<Result<object>>(`${AUTH}/register`, body),

  forgotPassword: (body: ForgotPasswordRequest) =>
    axiosInstance.post<Result<object>>(`${AUTH}/forgot-password`, body),

  resetPassword: (body: ResetPasswordRequest) =>
    axiosInstance.post<Result<object>>(`${AUTH}/reset-password`, body),

  changePassword: (body: ChangePasswordRequest) =>
    axiosInstance.post<Result<object>>(`${AUTH}/change-password`, body),

  createRole: (body: CreateRoleRequest) =>
    axiosInstance.post<Result<object>>(`${AUTH}/role`, body),

  createPermission: (body: CreatePermissionRequest) =>
    axiosInstance.post<Result<object>>(`${AUTH}/permission`, body),

  assignPermissions: (body: AssignPermissionsRequest) =>
    axiosInstance.post<Result<object>>(`${AUTH}/role/assign-permisison`, body),

  getAllRoles: (params?: { pageIndex?: number; pageSize?: number }) =>
    axiosInstance.get<Result<PagedResult<RoleDTO>>>(`${AUTH}/role`, { params }),
};