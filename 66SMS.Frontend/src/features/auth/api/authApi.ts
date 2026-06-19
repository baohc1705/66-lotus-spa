import axiosInstance from '@/shared/api/axiosInstance';
import { API } from '@/shared/api/endpoints';
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
  SendOtpRequest,
  VerifyOtpRequest,
} from '@/features/auth/types/auth.types';
import type { CreateCustomerPayload } from '@/features/customers/types/customer.types';

export const authApi = {
  login: (body: LoginRequest) =>
    axiosInstance.post<Result<TokenResponseDTO>>(API.auth.login, body).then(r => r.data),

  logout: () =>
    axiosInstance.post<Result<object>>(API.auth.logout).then(r => r.data),

  refreshToken: (token: string) =>
    axiosInstance.post<Result<TokenResponseDTO>>(API.auth.refreshToken, { token }).then(r => r.data),

  // Public registration — AllowAnonymous on POST /auth/register, NOT POST /customer
  register: (body: CreateCustomerPayload) =>
    axiosInstance.post<Result<object>>(API.auth.register, body).then(r => r.data),

  forgotPassword: (body: ForgotPasswordRequest) =>
    axiosInstance.post<Result<object>>(API.auth.forgotPassword, body).then(r => r.data),

  resetPassword: (body: ResetPasswordRequest) =>
    axiosInstance.post<Result<object>>(API.auth.resetPassword, body).then(r => r.data),

  changePassword: (body: ChangePasswordRequest) =>
    axiosInstance.post<Result<object>>(API.auth.changePassword, body).then(r => r.data),

  sendOtp: (body: SendOtpRequest) =>
    axiosInstance.post<Result<object>>(API.auth.sendOtp, body).then(r => r.data),

  verifyOtp: (body: VerifyOtpRequest) =>
    axiosInstance.post<Result<object>>(API.auth.verifyOtp, body).then(r => r.data),

  createRole: (body: CreateRoleRequest) =>
    axiosInstance.post<Result<object>>(API.auth.role, body).then(r => r.data),

  createPermission: (body: CreatePermissionRequest) =>
    axiosInstance.post<Result<object>>(API.auth.permission, body).then(r => r.data),

  assignPermissions: (body: AssignPermissionsRequest) =>
    axiosInstance.post<Result<object>>(API.auth.roleAssign, body).then(r => r.data),

  getAllRoles: (params?: { pageIndex?: number; pageSize?: number }) =>
    axiosInstance.get<Result<PagedResult<RoleDTO>>>(API.auth.role, { params }).then(r => r.data),
};
