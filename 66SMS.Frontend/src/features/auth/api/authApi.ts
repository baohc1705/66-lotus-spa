import axiosInstance from '@/shared/api/axiosInstance';
import { API } from '@/shared/api/endpoints';
import type { Result } from '@/shared/types/common.types';
import type {
  TokenResponseDTO,
  RoleDTO,
  PermissionDTO,
  UpdateRoleRequest,
  UpdatePermissionRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  CreateRoleRequest,
  CreatePermissionRequest,
  AssignPermissionsRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  RegisterPayload,
  RegisterResponseDto,
} from '@/features/auth/types/auth.types';

export const authApi = {
  login: (body: LoginRequest) =>
    axiosInstance.post<Result<TokenResponseDTO>>(API.auth.login, body).then(r => r.data),

  logout: () =>
    axiosInstance.post<Result<object>>(API.auth.logout).then(r => r.data),

  refreshToken: (token: string) =>
    axiosInstance.post<Result<TokenResponseDTO>>(API.auth.refreshToken, { token }).then(r => r.data),

  // Public registration — AllowAnonymous on POST /auth/register, NOT POST /customer
  register: (body: RegisterPayload) =>
    axiosInstance.post<Result<RegisterResponseDto>>(API.auth.register, body).then(r => r.data),

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

  getAllRoles: () =>
    axiosInstance.get<Result<RoleDTO[]>>(API.auth.role).then(r => r.data),

  getAllPermissions: () =>
    axiosInstance.get<Result<PermissionDTO[]>>(API.auth.permission).then(r => r.data),

  updateRole: (id: number, body: UpdateRoleRequest) =>
    axiosInstance.put<Result<object>>(`${API.auth.role}/${id}`, body).then(r => r.data),

  deleteRole: (id: number) =>
    axiosInstance.delete<Result<object>>(`${API.auth.role}/${id}`).then(r => r.data),

  updatePermission: (id: number, body: UpdatePermissionRequest) =>
    axiosInstance.put<Result<object>>(`${API.auth.permission}/${id}`, body).then(r => r.data),

  deletePermission: (id: number) =>
    axiosInstance.delete<Result<object>>(`${API.auth.permission}/${id}`).then(r => r.data),
};
