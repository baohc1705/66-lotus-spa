import { serviceCategoryApi } from "@/features/service_categories/api/serviceCategory.api";
import type {
  CreateServiceCategoryRequest,
  GetAllServiceCategoryQuery,
  UpdateServiceCategoryRequest,
} from "@/features/service_categories/types/serviceCategory.types";
import { StatusActive } from "@/shared/constants/status.enum";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys cho nhóm dịch vụ để dùng trong query cache
export const SERVICE_CATEGORY_QUERY_KEY =
  createEntityQueryKeys<GetAllServiceCategoryQuery>("service-categories");

// Lấy danh sách nhóm dịch vụ
export function useServiceCategories(
  params: GetAllServiceCategoryQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: SERVICE_CATEGORY_QUERY_KEY.list(params),
    queryFn: () => serviceCategoryApi.getAll(params),
    enabled,
  });
}

// Lấy danh sách nhóm dịch vụ admin
export function useServiceCategoriesAdmin(
  params: GetAllServiceCategoryQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: SERVICE_CATEGORY_QUERY_KEY.adminList(params),
    queryFn: () => serviceCategoryApi.adminGetAll(params),
    enabled,
  });
}

// Lấy chi tiết nhóm dịch vụ
export function useServiceCategoryDetail(id: number) {
  return useQuery({
    queryKey: SERVICE_CATEGORY_QUERY_KEY.detail(id),
    queryFn: () => serviceCategoryApi.getDetail(id),
  });
}

// Tạo nhóm dịch vụ
export function useCreateServiceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceCategoryRequest) =>
      serviceCategoryApi.create(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: SERVICE_CATEGORY_QUERY_KEY.all,
      });
      showSuccess("Tạo nhóm dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi tạo nhóm dịch vụ"));
    },
  });
}

// Sửa nhóm dịch vụ
export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateServiceCategoryRequest;
    }) => serviceCategoryApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: SERVICE_CATEGORY_QUERY_KEY.all,
      });
      showSuccess("Sửa nhóm dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi sửa nhóm dịch vụ"));
    },
  });
}

// Xóa nhóm dịch vụ
export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceCategoryApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: SERVICE_CATEGORY_QUERY_KEY.all,
      });
      showSuccess("Xóa nhóm dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa nhóm dịch vụ"));
    },
  });
}

// Xóa nhiều nhóm dịch vụ
export function useDeleteBulkServiceCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => serviceCategoryApi.deleteBulk(ids),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: SERVICE_CATEGORY_QUERY_KEY.all,
      });
      showSuccess("Xóa nhiều nhóm dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(
        getErrorMessage(error, "Có lỗi xảy ra khi xóa nhiều nhóm dịch vụ"),
      );
    },
  });
}

// Khôi phục nhóm dịch vụ
export function useRestoreServiceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      serviceCategoryApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: SERVICE_CATEGORY_QUERY_KEY.all,
      });
      showSuccess("Khôi phục nhóm dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(
        getErrorMessage(error, "Có lỗi xảy ra khi khôi phục nhóm dịch vụ"),
      );
    },
  });
}
