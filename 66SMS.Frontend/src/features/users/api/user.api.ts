import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type { UserAccountDto, UserDto } from "../types/user.types";
import type { CreateUserPayload, UpdateUserPayload } from "../types/user.types";

export const usersApi = {
  getMe: () =>
    axiosInstance.get<Result<UserDto>>(API.users.me).then((r) => r.data),

  getAll: (params?: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<UserDto>>>(API.users.base, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<UserDto>>(`${API.users.base}/${id}`)
      .then((r) => r.data),

  create: (body: CreateUserPayload) =>
    axiosInstance
      .post<Result<object>>(API.auth.register, body)
      .then((r) => r.data),

  update: (body: UpdateUserPayload) =>
    axiosInstance.put<Result<object>>(API.users.base, body).then((r) => r.data),

  delete: (body: { id?: number; ids?: number[] }) =>
    axiosInstance
      .delete<Result<object>>(API.users.base, { data: body })
      .then((r) => r.data),
      
  getAllAccounts: (params?: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<UserAccountDto>>>(API.users.accounts, { params })
      .then((r) => r.data),
};
