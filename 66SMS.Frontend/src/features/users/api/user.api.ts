import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type { UserAccountDto, UserDto } from "../types/user.types";
import type { CreateUserPayload, UpdateUserPayload } from "../types/user.types";

export const usersApi = {
  getMe: () =>
    axiosInstance.get<Result<UserDto>>("/users/me").then((r) => r.data),

  getAll: (params?: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<UserDto>>>("/users", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<UserDto>>(`/users/${id}`)
      .then((r) => r.data),

  create: (body: CreateUserPayload) =>
    axiosInstance
      .post<Result<object>>("/auth/register", body)
      .then((r) => r.data),

  update: (body: UpdateUserPayload) =>
    axiosInstance.put<Result<object>>("/users", body).then((r) => r.data),

  delete: (body: { id?: number; ids?: number[] }) =>
    axiosInstance
      .delete<Result<object>>("/users", { data: body })
      .then((r) => r.data),

  getAllAccounts: (params?: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<UserAccountDto>>>("/users/accounts", { params })
      .then((r) => r.data),
};
