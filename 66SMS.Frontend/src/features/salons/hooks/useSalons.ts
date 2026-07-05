import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { salonApi } from "../api/salon.api";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type {
  SalonQueryParams,
  CreateSalonPayload,
  UpdateSalonPayload,
} from "../types/salon.types";
import type { Result } from "@/shared/types/common.types";

const ENTITY = "chi nhánh";

export const SALON_KEYS = {
  all: ["salons"] as const,
  lists: () => [...SALON_KEYS.all, "list"] as const,
  list: (params: SalonQueryParams) => [...SALON_KEYS.lists(), params] as const,
  details: () => [...SALON_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SALON_KEYS.details(), id] as const,
};

export function useSalons(params: SalonQueryParams, enabled = true) {
  return useQuery({
    queryKey: SALON_KEYS.list(params),
    queryFn: () => salonApi.getAll(params),
    enabled,
  });
}

export function useAdminSalons(params: SalonQueryParams, enabled = true) {
  return useQuery({
    queryKey: SALON_KEYS.list(params),
    queryFn: () => salonApi.getAdminAll(params),
    enabled,
  });
}

export function useSalonDetail(id: number | null) {
  return useQuery({
    queryKey: SALON_KEYS.detail(id!),
    queryFn: () => salonApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateSalonMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalonPayload) => salonApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SALON_KEYS.lists() });
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

export function useUpdateSalonMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateSalonPayload;
    }) => salonApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SALON_KEYS.all });
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

export function useDeleteSalonMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salonApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SALON_KEYS.all });
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
