import type { AxiosError } from "axios";
import { createEntityQueryKeys } from "@/shared/utils/queryKeys";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { timeSlotApi } from "@/features/time_slots/api/timeSlot.api";
import type { PageRequest, Result } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/kitToast";
import type {
  CreateTimeSlotPayload,
  UpdateTimeSlotPayload,
} from "../types/time_slot.types";

const ENTITY = "khung giờ";

export const TIME_SLOT_KEYS = createEntityQueryKeys<PageRequest>("time-slots");

export function useTimeSlots(params: PageRequest) {
  return useQuery({
    queryKey: TIME_SLOT_KEYS.list(params),
    queryFn: () => timeSlotApi.getAll(params),
  });
}

export function useAdminTimeSlots(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: TIME_SLOT_KEYS.adminList(params),
    queryFn: () => timeSlotApi.getAll(params),
    enabled,
  });
}

export function useTimeSlotDetail(id: number | null) {
  return useQuery({
    queryKey: TIME_SLOT_KEYS.detail(id!),
    queryFn: () => timeSlotApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTimeSlotPayload) => timeSlotApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIME_SLOT_KEYS.all });
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

export function useUpdateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateTimeSlotPayload;
    }) => timeSlotApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIME_SLOT_KEYS.all });
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

export function useDeleteTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => timeSlotApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIME_SLOT_KEYS.all });
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
