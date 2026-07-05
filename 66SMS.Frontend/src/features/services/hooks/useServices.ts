import { serviceApi, serviceImageApi, serviceProductApi } from "@/features/services/api/service.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import type {
  CreateServicePayload,
  UpdateServicePayload,
  CreateServiceImagePayload,
  UpdateServiceImagePayload,
  CreateServiceProductPayload,
  UpdateServiceProductPayload,
} from "../types/service.types";

const ENTITY = "dịch vụ";

const SERVICE_KEYS = {
  all: ["services"] as const,
  lists: () => [...SERVICE_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...SERVICE_KEYS.lists(), params] as const,
  deletedLists: () => [...SERVICE_KEYS.all, "deleted"] as const,
  deletedList: (params: PageRequest) =>
    [...SERVICE_KEYS.deletedLists(), params] as const,
  details: () => [...SERVICE_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SERVICE_KEYS.details(), id] as const,
};

export function useServices(params: PageRequest, enabled = true) {
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
    queryKey: SERVICE_KEYS.list(params),
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
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.lists() });
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
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("cập nhật", ENTITY);
      toast.error(msg);
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
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("xóa", ENTITY);
      toast.error(msg);
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
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("xóa", ENTITY);
      toast.error(msg);
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
      const msg = error.response?.data?.message ?? TOAST_MSG.actionError("khôi phục", ENTITY);
      toast.error(msg);
    },
  });
}

export function useCreateServiceImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServiceImagePayload) =>
      serviceImageApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Thêm", "ảnh"));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.subActionError("thêm", "ảnh");
      toast.error(msg);
    },
  });
}

export function useUpdateServiceImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateServiceImagePayload;
    }) => serviceImageApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Cập nhật", "ảnh"));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.subActionError("cập nhật", "ảnh");
      toast.error(msg);
    },
  });
}

export function useDeleteServiceImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceImageApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Xóa", "ảnh"));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? TOAST_MSG.subActionError("xóa", "ảnh");
      toast.error(msg);
    },
  });
}

export function useCreateServiceProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServiceProductPayload) =>
      serviceProductApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Thêm", "sản phẩm đi kèm"));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg =
        error.response?.data?.message ??
        TOAST_MSG.subActionError("thêm", "sản phẩm đi kèm");
      toast.error(msg);
    },
  });
}

export function useUpdateServiceProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateServiceProductPayload;
    }) => serviceProductApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Cập nhật", "sản phẩm đi kèm"));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg =
        error.response?.data?.message ??
        TOAST_MSG.subActionError("cập nhật", "sản phẩm đi kèm");
      toast.error(msg);
    },
  });
}

export function useDeleteServiceProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceProductApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success(TOAST_MSG.subActionSuccess("Xóa", "sản phẩm đi kèm"));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg =
        error.response?.data?.message ??
        TOAST_MSG.subActionError("xóa", "sản phẩm đi kèm");
      toast.error(msg);
    },
  });
}
