import { serviceApi } from "@/features/services/api/service.api";
import type {
  CreateServiceRequest,
  GetAllServiceQuery,
  UpdateServiceRequest,
} from "@/features/services/types/service.types";
import { StatusActive } from "@/shared/constants/status.enum";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys cho dịch vụ để dùng trong query cache
export const SERVICE_QUERY_KEY =
  createEntityQueryKeys<GetAllServiceQuery>("services");

// Lấy danh sách dịch vụ
export function useServices(params: GetAllServiceQuery, enabled = true) {
  return useQuery({
    queryKey: SERVICE_QUERY_KEY.list(params),
    queryFn: () => serviceApi.getAll(params),
    enabled,
  });
}

// Lấy danh sách dịch vụ admin
export function useServicesAdmin(params: GetAllServiceQuery, enabled = true) {
  return useQuery({
    queryKey: SERVICE_QUERY_KEY.adminList(params),
    queryFn: () => serviceApi.adminGetAll(params),
    enabled,
  });
}

// Lấy chi tiết dịch vụ
export function useServiceDetail(id?: number | null) {
  return useQuery({
    queryKey: SERVICE_QUERY_KEY.detail(id ?? 0),
    queryFn: () => serviceApi.getDetail(id!),
    enabled: id != null && id > 0,
  });
}

// Tạo dịch vụ
export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceApi.create(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEY.all });
      showSuccess("Tạo dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi tạo dịch vụ"));
    },
  });
}

// Sửa dịch vụ
export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceRequest }) =>
      serviceApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEY.all });
      showSuccess("Sửa dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi sửa dịch vụ"));
    },
  });
}

// Xóa dịch vụ
export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEY.all });
      showSuccess("Xóa dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa dịch vụ"));
    },
  });
}

// Xóa nhiều dịch vụ
export function useDeleteBulkServices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => serviceApi.deleteBulk(ids),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEY.all });
      showSuccess("Xóa nhiều dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa nhiều dịch vụ"));
    },
  });
}

// Khôi phục dịch vụ
export function useRestoreService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      serviceApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEY.all });
      showSuccess("Khôi phục dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi khôi phục dịch vụ"));
    },
  });
}

// Xóa sản phẩm tiêu hao khỏi dịch vụ
export function useDeleteServiceProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceApi.deleteServiceProduct(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEY.all });
      showSuccess("Đã xóa sản phẩm khỏi dịch vụ");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Không thể xóa sản phẩm khỏi dịch vụ"));
    },
  });
}
