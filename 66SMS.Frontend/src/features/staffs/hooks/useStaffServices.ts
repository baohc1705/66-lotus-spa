import { staffServiceApi } from "@/features/staffs/api/staffService.api";
import type {
  CreateStaffServiceRequest,
  GetStaffServicesQuery,
  UpdateStaffServiceRequest,
} from "@/features/staffs/types/staffService.types";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys cho phân công dịch vụ để dùng trong query cache
export const STAFF_SERVICE_QUERY_KEY =
  createEntityQueryKeys<GetStaffServicesQuery>("staff-services");

// Lấy danh sách phân công dịch vụ
export function useStaffServices(
  params: GetStaffServicesQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: STAFF_SERVICE_QUERY_KEY.list(params),
    queryFn: () => staffServiceApi.getAll(params),
    enabled,
  });
}

// Tạo phân công dịch vụ
export function useCreateStaffService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffServiceRequest) =>
      staffServiceApi.create(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: STAFF_SERVICE_QUERY_KEY.all });
      showSuccess("Phân công dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi phân công dịch vụ"));
    },
  });
}

// Sửa phân công dịch vụ
export function useUpdateStaffService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateStaffServiceRequest;
    }) => staffServiceApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: STAFF_SERVICE_QUERY_KEY.all });
      showSuccess("Cập nhật phân công dịch vụ thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(
        getErrorMessage(error, "Có lỗi xảy ra khi cập nhật phân công dịch vụ"),
      );
    },
  });
}

// Xóa phân công dịch vụ
export function useDeleteStaffServices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => staffServiceApi.delete(ids),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: STAFF_SERVICE_QUERY_KEY.all });
      showSuccess("Đã gỡ phân công dịch vụ");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(
        getErrorMessage(error, "Có lỗi xảy ra khi gỡ phân công dịch vụ"),
      );
    },
  });
}
