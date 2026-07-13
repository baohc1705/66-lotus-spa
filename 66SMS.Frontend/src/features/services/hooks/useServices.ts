import { serviceApi } from "@/features/services/api/service.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type {
  CreateServicePayload,
  UpdateServicePayload,
} from "../types/service.types";

const ENTITY = "dịch vụ";

export const SERVICE_KEYS = createEntityQueryKeys<PageRequest & { categoryId?: number }>("services");

export function useServices(params: PageRequest & { categoryId?: number }, enabled = true) {
  return useQuery({
    queryKey: SERVICE_KEYS.list(params),
    queryFn: () => serviceApi.getAll(params),
    enabled,
  });
}

export function useAdminServices(
  params: PageRequest & { categoryId?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: SERVICE_KEYS.adminList(params),
    queryFn: () => serviceApi.adminGetAll(params),
    enabled,
  });
}

export function useDeletedServices(
  params: PageRequest & { categoryId?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: SERVICE_KEYS.deletedList(params),
    queryFn: () => serviceApi.getAllDeleted(params),
    enabled,
  });
}

export function useServiceDetail(id: number | null) {
  return useQuery({
    queryKey: SERVICE_KEYS.detail(id!),
    queryFn: () => serviceApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServicePayload) => serviceApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.createSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("tạo", ENTITY)));
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateServicePayload;
    }) => serviceApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("cập nhật", ENTITY)));
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.deleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("xóa", ENTITY)));
    },
  });
}

export function useDeleteServiceMultiples() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => serviceApi.deleteMultiples({ ids }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.bulkDeleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("xóa", ENTITY)));
    },
  });
}

export function useRestoreService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      serviceApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.restoreSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, TOAST_MSG.actionError("khôi phục", ENTITY)));
    },
  });
}

export function useDeleteServiceProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceApi.deleteServiceProduct(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success("Đã xóa sản phẩm khỏi dịch vụ");
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, "Không thể xóa sản phẩm khỏi dịch vụ"),
      );
    },
  });
}
