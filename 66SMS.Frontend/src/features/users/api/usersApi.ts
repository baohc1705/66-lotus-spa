import axiosInstance from '@/shared/api/axiosInstance';
import type { Result, PagedResult, PageRequest } from '@/shared/types/common.types';
import type { UserDto, CreateUserRequest, UpdateUserRequest, DeleteUserRequest } from '@/features/users/types/user.types';

const USERS = '/users';

export const usersApi = {
  getMe: () =>
    axiosInstance.get<Result<UserDto>>(`${USERS}/me`),

  getAll: (params?: PageRequest) =>
    axiosInstance.get<Result<PagedResult<UserDto>>>(USERS, { params }),

  getDetail: (id: number) =>
    axiosInstance.get<Result<UserDto>>(`${USERS}/${id}`),

  create: (body: CreateUserRequest) =>
    axiosInstance.post<Result<object>>(`/auth/register`, body),

  update: (body: UpdateUserRequest) =>
    axiosInstance.put<Result<object>>(USERS, body),

  delete: (body: DeleteUserRequest) =>
    axiosInstance.delete<Result<object>>(USERS, { data: body }),
};