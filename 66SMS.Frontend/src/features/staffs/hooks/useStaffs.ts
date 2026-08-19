import { staffApi } from "@/features/staffs/api/staff.api";
import type {
  CreateStaffRequest,
  GetAllStaffQuery,
  UpdateStaffRequest,
} from "@/features/staffs/types/staff.types";
import { StatusActive } from "@/shared/constants/status.enum";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys cho nhân viên để dùng trong query cache
export const STAFF_QUERY_KEY =
  createEntityQueryKeys<GetAllStaffQuery>("staffs");

// Lấy danh sách nhân viên
export function useStaffs(params: GetAllStaffQuery, enabled = true) {
  return useQuery({
    queryKey: STAFF_QUERY_KEY.list(params),
    queryFn: () => staffApi.getAll(params),
    enabled,
  });
}

// Lấy danh sách nhân viên admin
export function useStaffsAdmin(params: GetAllStaffQuery, enabled = true) {
  return useQuery({
    queryKey: STAFF_QUERY_KEY.adminList(params),
    queryFn: () => staffApi.adminGetAll(params),
    enabled,
  });
}

// Lấy chi tiết nhân viên
export function useStaffDetail(id?: number | null) {
  return useQuery({
    queryKey: STAFF_QUERY_KEY.detail(id ?? 0),
    queryFn: () => staffApi.getDetail(id!),
    enabled: id != null && id > 0,
  });
}

// Tạo nhân viên
export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffRequest) => staffApi.create(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY.all });
      showSuccess("Tạo nhân viên thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi tạo nhân viên"));
    },
  });
}

// Sửa nhân viên
export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStaffRequest }) =>
      staffApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY.all });
      showSuccess("Cập nhật nhân viên thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi cập nhật nhân viên"));
    },
  });
}

// Xóa nhân viên
export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY.all });
      showSuccess("Xóa nhân viên thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa nhân viên"));
    },
  });
}

// Xóa nhiều nhân viên
export function useDeleteBulkStaffs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => staffApi.deleteBulk(ids),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY.all });
      showSuccess("Xóa nhiều nhân viên thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa nhiều nhân viên"));
    },
  });
}

// Khôi phục nhân viên
export function useRestoreStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      staffApi.update(id, { status: StatusActive.Active }),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY.all });
      showSuccess("Khôi phục nhân viên thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi khôi phục nhân viên"));
    },
  });
}
