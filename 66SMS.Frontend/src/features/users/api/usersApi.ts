import axiosInstance from '@/shared/api/axiosInstance';
import { API } from '@/shared/api/endpoints';
import type { Result, PagedResult, PageRequest } from '@/shared/types/common.types';
import type { UserDto, CreateUserRequest, UpdateUserRequest, DeleteUserRequest } from '@/features/users/types/user.types';

export const usersApi = {
  getMe: () =>
    axiosInstance.get<Result<UserDto>>(API.users.me).then(r => r.data),

  getAll: (params?: PageRequest) =>
    axiosInstance.get<Result<PagedResult<UserDto>>>(API.users.base, { params }).then(r => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<UserDto>>(`${API.users.base}/${id}`).then(r => r.data),

  create: (body: CreateUserRequest) =>
    axiosInstance.post<Result<object>>(API.auth.register, body).then(r => r.data),

  update: (body: UpdateUserRequest) =>
    axiosInstance.put<Result<object>>(API.users.base, body).then(r => r.data),

  delete: (body: DeleteUserRequest) =>
    axiosInstance.delete<Result<object>>(API.users.base, { data: body }).then(r => r.data),
};