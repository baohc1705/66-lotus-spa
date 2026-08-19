import { staffSalonApi } from "@/features/salons/api/staffSalon.api";
import type {
    CreateStaffSalonRequest,
    GetAllStaffSalonQuery,
    UpdateStaffSalonRequest,
} from "@/features/salons/types/staffSalon.types";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys để dùng trong query cache
export const STAFF_SALON_QUERY_KEY =
  createEntityQueryKeys<GetAllStaffSalonQuery>("staff-salons");

// Lấy danh sách nhân viên chi nhánh
export function useStaffSalons(params: GetAllStaffSalonQuery) {
  return useQuery({
    queryKey: STAFF_SALON_QUERY_KEY.list(params),
    queryFn: () => staffSalonApi.getAll(params),
  });
}

// Lấy chi tiết nhân viên chi nhánh
export function useStaffSalonDetail(id: number | null) {
  return useQuery({
    queryKey: STAFF_SALON_QUERY_KEY.detail(id!),
    queryFn: () => staffSalonApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

// Tạo nhân viên chi nhánh
export function useCreateStaffSalon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffSalonRequest) =>
      staffSalonApi.create(payload),
    onSuccess: (result) => {
      if (!result.isSuccess) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({ queryKey: STAFF_SALON_QUERY_KEY.all });
      showSuccess("Gán nhân viên vào chi nhánh thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      showError(getErrorMessage(error)),
  });
}
// Cập nhật thông tin nhân viên chi nhánh
export function useUpdateStaffSalon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateStaffSalonRequest;
    }) => staffSalonApi.update(id, payload),
    onSuccess: (result) => {
      if (!result.isSuccess) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({ queryKey: STAFF_SALON_QUERY_KEY.all });
      showSuccess("Cập nhật thông tin nhân viên chi nhánh thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      showError(getErrorMessage(error)),
  });
}

// Xóa nhân viên chi nhánh
export function useDeleteStaffSalon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffSalonApi.delete(id),
    onSuccess: (result) => {
      if (!result.isSuccess) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }
      queryClient.invalidateQueries({ queryKey: STAFF_SALON_QUERY_KEY.all });
      showSuccess("Xóa nhân viên khỏi chi nhánh thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      showError(getErrorMessage(error)),
  });
}

// export function useAssignManager() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (payload: AssignManagerPayload) =>
//       staffSalonApi.assignManager(payload),
//     onSuccess: (result) => {
//       if (result.isSuccess) {
//         qc.invalidateQueries({ queryKey: STAFF_SALON_KEYS.all });
//         toast.success("Phân công quản lý thành công");
//       } else {
//         toast.error(result.message || "Có lỗi xảy ra");
//       }
//     },
//     onError: (error: AxiosError<Result<unknown>>) =>
//       toast.error(getErrorMessage(error)),
//   });
// }

// export function useRemoveManager() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (payload: AssignManagerPayload) =>
//       staffSalonApi.removeManager(payload),
//     onSuccess: (result) => {
//       if (result.isSuccess) {
//         qc.invalidateQueries({ queryKey: STAFF_SALON_KEYS.all });
//         toast.success("Gỡ quản lý thành công");
//       } else {
//         toast.error(result.message || "Có lỗi xảy ra");
//       }
//     },
//     onError: (error: AxiosError<Result<unknown>>) =>
//       toast.error(getErrorMessage(error)),
//   });
// }
