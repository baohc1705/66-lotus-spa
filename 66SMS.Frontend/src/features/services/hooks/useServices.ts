import { serviceApi } from "@/features/services/api/service.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type {
  CreateServicePayload,
  UpdateServicePayload,
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

export function useGetAllServicesUser(params: PageRequest) {
  return useQuery({
    queryKey: SERVICE_KEYS.list(params),
    queryFn: () => serviceApi.getAllServicesUsers(params),
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
