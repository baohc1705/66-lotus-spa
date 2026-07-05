import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { usersApi } from "../api/user.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { CreateUserPayload, UpdateUserPayload } from "../schemas/user.schema";

const ENTITY = "người dùng";

export const USER_KEYS = {
  all: ["users"] as const,
  me: () => [...USER_KEYS.all, "me"] as const,
  lists: () => [...USER_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...USER_KEYS.lists(), params] as const,
  details: () => [...USER_KEYS.all, "detail"] as const,
  detail: (id: number) => [...USER_KEYS.details(), id] as const,
};

export function useGetMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: USER_KEYS.me(),
    queryFn: async () => {
      const result = await usersApi.getMe();
      return result.data;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useGetUsers(params?: PageRequest, enabled = true) {
  return useQuery({
    queryKey: USER_KEYS.list(params ?? {}),
    queryFn: () => usersApi.getAll(params),
    enabled,
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: USER_KEYS.lists() });
        toast.success(TOAST_MSG.createSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("tạo", ENTITY);
      toast.error(msg);
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.update(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: USER_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("cập nhật", ENTITY);
      toast.error(msg);
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.delete({ id }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: USER_KEYS.all });
        toast.success(TOAST_MSG.deleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("xóa", ENTITY);
      toast.error(msg);
    },
  });
}

export function useDeleteUserMultiples() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => usersApi.delete({ ids }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: USER_KEYS.all });
        toast.success(TOAST_MSG.bulkDeleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("xóa", ENTITY);
      toast.error(msg);
    },
  });
}
