import { salonApi } from "@/features/salons/api/salon.api";
import type {
  CreateSalonRequest,
  GetAllSalonQuery,
  UpdateSalonRequest,
} from "@/features/salons/types/salon.types";
import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Tạo query keys cho chi nhánh để dùng trong query cache
export const SALON_QUERY_KEY =
  createEntityQueryKeys<GetAllSalonQuery>("salons");

// Lấy danh sách chi nhánh (public)
export function useSalons(params: GetAllSalonQuery, enabled = true) {
  return useQuery({
    queryKey: SALON_QUERY_KEY.list(params),
    queryFn: () => salonApi.getAll(params),
    enabled,
  });
}

// Lấy danh sách chi nhánh admin
export function useSalonsAdmin(params: GetAllSalonQuery, enabled = true) {
  return useQuery({
    queryKey: SALON_QUERY_KEY.adminList(params),
    queryFn: () => salonApi.adminGetAll(params),
    enabled,
  });
}

// Lấy chi nhánh đang hoạt động (dropdown, booking, ...)
export function useActiveSalons() {
  return useQuery({
    queryKey: [...SALON_QUERY_KEY.all, "active"] as const,
    queryFn: () => salonApi.getActiveItems(),
    staleTime: 5 * 60 * 1000,
  });
}

// Lấy chi nhánh trụ sở chính
export function usePrimarySalon() {
  return useQuery({
    queryKey: [...SALON_QUERY_KEY.all, "primary"] as const,
    queryFn: async () => {
      const result = await salonApi.getPrimary();
      return result.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Lấy chi tiết chi nhánh
export function useSalonDetail(id?: number | null) {
  return useQuery({
    queryKey: SALON_QUERY_KEY.detail(id ?? 0),
    queryFn: () => salonApi.getDetail(id!),
    enabled: id != null && id > 0,
  });
}

// Tạo chi nhánh
export function useCreateSalon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalonRequest) => salonApi.create(data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: SALON_QUERY_KEY.all });
      showSuccess("Tạo chi nhánh thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi tạo chi nhánh"));
    },
  });
}

// Sửa chi nhánh
export function useUpdateSalon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSalonRequest }) =>
      salonApi.update(id, data),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: SALON_QUERY_KEY.all });
      showSuccess("Cập nhật chi nhánh thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi cập nhật chi nhánh"));
    },
  });
}

// Xóa chi nhánh
export function useDeleteSalon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salonApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess !== true) {
        showError(result.message || "Có lỗi xảy ra");
        return;
      }

      queryClient.invalidateQueries({ queryKey: SALON_QUERY_KEY.all });
      showSuccess("Xóa chi nhánh thành công");
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, "Có lỗi xảy ra khi xóa chi nhánh"));
    },
  });
}
