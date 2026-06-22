import { serviceApi, serviceImageApi, serviceProductApi } from "@/features/services/api/service.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type {
  CreateServicePayload,
  UpdateServicePayload,
  GetAllServiceQuery,
  CreateServiceImagePayload,
  UpdateServiceImagePayload,
  CreateServiceProductPayload,
  UpdateServiceProductPayload,
} from "../types/service.types";

const SERVICE_KEYS = {
  all: ["services"] as const,
  lists: () => [...SERVICE_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...SERVICE_KEYS.lists(), params] as const,
  details: () => [...SERVICE_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SERVICE_KEYS.details(), id] as const,
};

export function useServices(params: PageRequest) {
  return useQuery({
    queryKey: SERVICE_KEYS.list(params),
    queryFn: () => serviceApi.getAll(params),
  });
}

export function useServicesAdmin(params: GetAllServiceQuery) {
  return useQuery({
    queryKey: SERVICE_KEYS.list(params),
    queryFn: () => serviceApi.adminGetAll(params),
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
        toast.success("Tạo dịch vụ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
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
        toast.success("Cập nhật dịch vụ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success("Xóa dịch vụ thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateServiceImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServiceImagePayload) => serviceImageApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success("Thêm ảnh thành công");
      } else {
        toast.error(result.message || "Không thể thêm ảnh");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateServiceImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateServiceImagePayload }) => serviceImageApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success("Cập nhật ảnh thành công");
      } else {
        toast.error(result.message || "Không thể cập nhật ảnh");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteServiceImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceImageApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success("Xóa ảnh thành công");
      } else {
        toast.error(result.message || "Không thể xóa ảnh");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateServiceProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServiceProductPayload) => serviceProductApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success("Thêm sản phẩm đi kèm thành công");
      } else {
        toast.error(result.message || "Không thể thêm sản phẩm");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateServiceProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateServiceProductPayload }) => serviceProductApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success("Cập nhật sản phẩm đi kèm thành công");
      } else {
        toast.error(result.message || "Không thể cập nhật sản phẩm");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteServiceProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceProductApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SERVICE_KEYS.all });
        toast.success("Xóa sản phẩm đi kèm thành công");
      } else {
        toast.error(result.message || "Không thể xóa sản phẩm");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
}
