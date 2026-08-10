import type { AxiosError } from "axios";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import {
  configAppointmentApi,
  type ConfigAppointmentListParams,
} from "../api/configAppointment.api";
import type { Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/kitToast";
import type {
  CreateConfigAppointmentPayload,
  UpdateConfigAppointmentPayload,
} from "../types/config_appointment.types";

const ENTITY = "cấu hình lịch hẹn";

export const CONFIG_APPOINTMENT_KEYS =
  createEntityQueryKeys<ConfigAppointmentListParams>("config-appointments");

export function useConfigAppointmentBySalon(salonId?: number | null) {
  return useQuery({
    queryKey: [...CONFIG_APPOINTMENT_KEYS.all, "by-salon", salonId],
    queryFn: () => configAppointmentApi.getBySalon(salonId!),
    enabled: !!salonId && salonId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminConfigAppointments(
  params: ConfigAppointmentListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: CONFIG_APPOINTMENT_KEYS.adminList(params),
    queryFn: () => configAppointmentApi.getAll(params),
    enabled,
  });
}

export function useConfigAppointmentDetail(id: number | null) {
  return useQuery({
    queryKey: CONFIG_APPOINTMENT_KEYS.detail(id!),
    queryFn: () => configAppointmentApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateConfigAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConfigAppointmentPayload) =>
      configAppointmentApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CONFIG_APPOINTMENT_KEYS.all });
        toast.success(`Tạo ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, `Có lỗi xảy ra khi tạo ${ENTITY}`));
    },
  });
}

export function useUpdateConfigAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateConfigAppointmentPayload;
    }) => configAppointmentApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CONFIG_APPOINTMENT_KEYS.all });
        toast.success(`Cập nhật ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(
        getErrorMessage(error, `Có lỗi xảy ra khi cập nhật ${ENTITY}`),
      );
    },
  });
}

export function useDeleteConfigAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => configAppointmentApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: CONFIG_APPOINTMENT_KEYS.all });
        toast.success(`Xóa ${ENTITY} thành công`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, `Có lỗi xảy ra khi xóa ${ENTITY}`));
    },
  });
}
