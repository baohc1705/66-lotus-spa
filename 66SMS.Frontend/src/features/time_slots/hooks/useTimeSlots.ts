import { timeSlotApi } from "@/features/time_slots/api/timeSlot.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type {
  CreateTimeSlotPayload,
  UpdateTimeSlotPayload,
} from "../types/time_slot.types";

const ENTITY = "khung giờ";

const TIME_SLOT_KEYS = {
  all: ["time-slots"] as const,
  lists: () => [...TIME_SLOT_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...TIME_SLOT_KEYS.lists(), params] as const,
  details: () => [...TIME_SLOT_KEYS.all, "detail"] as const,
  detail: (id: number) => [...TIME_SLOT_KEYS.details(), id] as const,
};

export function useTimeSlots(params: PageRequest) {
  return useQuery({
    queryKey: TIME_SLOT_KEYS.list(params),
    queryFn: () => timeSlotApi.getAll(params),
  });
}

export function useAdminTimeSlots(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: TIME_SLOT_KEYS.list(params),
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
    mutationFn: (payload: CreateTimeSlotPayload) =>
      timeSlotApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: TIME_SLOT_KEYS.lists() });
        toast.success(TOAST_MSG.createSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("tạo", ENTITY));
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
        toast.success(TOAST_MSG.updateSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("cập nhật", ENTITY));
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
        toast.success(TOAST_MSG.deleteSuccess(ENTITY));
      } else {
        toast.error(result.message || COMMON_MSG.error);
      }
    },
    onError: () => {
      toast.error(TOAST_MSG.actionError("xóa", ENTITY));
    },
  });
}
