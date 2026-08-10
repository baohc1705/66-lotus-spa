import axiosInstance from "@/shared/api/axiosInstance";
import type { Result } from "@/shared/types/common.types";
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
} from "@/features/auth/types/auth.types";

export const authApi = {
  login: (body: LoginRequest) =>
    axiosInstance
      .post<Result<TokenResponseDTO>>("/auth/login", body)
      .then((r) => r.data),

  logout: () =>
    axiosInstance.post<Result<object>>("/auth/logout").then((r) => r.data),

  refreshToken: (token: string) =>
    axiosInstance
      .post<Result<TokenResponseDTO>>("/auth/refresh-token", { token })
      .then((r) => r.data),

  register: (body: RegisterPayload) =>
    axiosInstance
      .post<Result<number>>("/auth/register", body)
      .then((r) => r.data),

  forgotPassword: (body: ForgotPasswordRequest) =>
    axiosInstance
      .post<Result<object>>("/auth/forgot-password", body)
      .then((r) => r.data),

  resetPassword: (body: ResetPasswordRequest) =>
    axiosInstance
      .post<Result<object>>("/auth/reset-password", body)
      .then((r) => r.data),

  changePassword: (body: ChangePasswordRequest) =>
    axiosInstance
      .post<Result<object>>("/auth/change-password", body)
      .then((r) => r.data),

  sendOtp: (body: SendOtpRequest) =>
    axiosInstance
      .post<Result<object>>("/auth/send-otp", body)
      .then((r) => r.data),

  verifyOtp: (body: VerifyOtpRequest) =>
    axiosInstance
      .post<Result<object>>("/auth/verify-otp", body)
      .then((r) => r.data),

  createRole: (body: CreateRoleRequest) =>
    axiosInstance.post<Result<object>>("/auth/role", body).then((r) => r.data),

  createPermission: (body: CreatePermissionRequest) =>
    axiosInstance
      .post<Result<object>>("/auth/permission", body)
      .then((r) => r.data),

  assignPermissions: (body: AssignPermissionsRequest) =>
    axiosInstance
      .post<Result<object>>("/auth/role/assign-permission", body)
      .then((r) => r.data),

  getAllRoles: () =>
    axiosInstance.get<Result<RoleDTO[]>>("/auth/role").then((r) => r.data),

  getAllPermissions: () =>
    axiosInstance
      .get<Result<PermissionDTO[]>>("/auth/permission")
      .then((r) => r.data),

  updateRole: (id: number, body: UpdateRoleRequest) =>
    axiosInstance
      .put<Result<object>>(`/auth/role/${id}`, body)
      .then((r) => r.data),

  deleteRole: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`/auth/role/${id}`)
      .then((r) => r.data),

  updatePermission: (id: number, body: UpdatePermissionRequest) =>
    axiosInstance
      .put<Result<object>>(`/auth/permission/${id}`, body)
      .then((r) => r.data),

  deletePermission: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`/auth/permission/${id}`)
      .then((r) => r.data),
};
