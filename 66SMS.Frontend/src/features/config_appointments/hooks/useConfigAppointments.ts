import type { Result } from "@/shared/types/common.types";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { showError, showSuccess } from "@/shared/utils/kitToast";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { configAppointmentApi } from "../api/configAppointment.api";
import type { CreateConfigAppointmentRequest, GetAllConfigAppointmentQuery, UpdateConfigAppointmentRequest } from "../types/configAppointment.types";

// Tạo query keys cho dịch vụ để dùng trong query cache
export const CONFIG_APPOINTMENT_QUERY_KEY =
  createEntityQueryKeys<GetAllConfigAppointmentQuery>("config-appointments");

// Lấy danh sách cấu hình lịch hẹn theo salon
export function useConfigAppointmentBySalon(salonId?: number | null) {
  return useQuery({
    queryKey: [...CONFIG_APPOINTMENT_QUERY_KEY.all, "by-salon", salonId],
    queryFn: () => configAppointmentApi.getBySalon(salonId!),
    enabled: !!salonId && salonId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
// Lấy danh sách cấu hình lịch hẹn admin
export function useConfigAppointments(
  params: GetAllConfigAppointmentQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: CONFIG_APPOINTMENT_QUERY_KEY.list(params),
    queryFn: () => configAppointmentApi.getAll(params),
    enabled,
  });
}

// Lấy chi tiết cấu hình lịch hẹn
export function useConfigAppointmentDetail(id?: number | null) {
  return useQuery({
    queryKey: CONFIG_APPOINTMENT_QUERY_KEY.detail(id!),
    queryFn: () => configAppointmentApi.getDetail(id!),
  });
}

export function useCreateConfigAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConfigAppointmentRequest) =>
      configAppointmentApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        queryClient.invalidateQueries({ queryKey: CONFIG_APPOINTMENT_QUERY_KEY.all });
        showSuccess(`Tạo cấu hình lịch hẹn thành công`);
      } else {
        showError(result.message || "Có lỗi xảy ra khi tạo cấu hình lịch hẹn");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi tạo cấu hình lịch hẹn`));
    },
  });
}

export function useUpdateConfigAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateConfigAppointmentRequest }) =>
      configAppointmentApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        queryClient.invalidateQueries({ queryKey: CONFIG_APPOINTMENT_QUERY_KEY.all });
        showSuccess(`Cập nhật cấu hình lịch hẹn thành công`);
      } else {
        showError(result.message || "Có lỗi xảy ra khi cập nhật cấu hình lịch hẹn");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(getErrorMessage(error, `Có lỗi xảy ra khi cập nhật cấu hình lịch hẹn`));
    },
  });
}

export function useDeleteConfigAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => configAppointmentApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        queryClient.invalidateQueries({ queryKey: CONFIG_APPOINTMENT_QUERY_KEY.all });
        showSuccess(`Xóa cấu hình lịch hẹn thành công`);
      } else {
        showError(result.message || "Có lỗi xảy ra khi xóa cấu hình lịch hẹn");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      showError(
        getErrorMessage(error, `Có lỗi xảy ra khi xóa cấu hình lịch hẹn`),
      );
    },
  });
}
