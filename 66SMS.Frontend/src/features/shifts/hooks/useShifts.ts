import { shiftApi } from "@/features/shifts/api/shift.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TOAST_MSG } from "@/shared/constants/toast.messages";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type {
  CreateShiftPayload,
  UpdateShiftPayload,
} from "../types/shift.types";

const ENTITY = "ca làm việc";

const SHIFT_KEYS = {
  all: ["shifts"] as const,
  lists: () => [...SHIFT_KEYS.all, "list"] as const,
  list: (params: PageRequest) => [...SHIFT_KEYS.lists(), params] as const,
  details: () => [...SHIFT_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SHIFT_KEYS.details(), id] as const,
};

export function useShifts(params: PageRequest) {
  return useQuery({
    queryKey: SHIFT_KEYS.list(params),
    queryFn: () => shiftApi.getAll(params),
  });
}

export function useAdminShifts(params: PageRequest, enabled = true) {
  return useQuery({
    queryKey: SHIFT_KEYS.list(params),
    queryFn: () => shiftApi.getAll(params),
    enabled,
  });
}

export function useShiftDetail(id: number | null) {
  return useQuery({
    queryKey: SHIFT_KEYS.detail(id!),
    queryFn: () => shiftApi.getDetail(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShiftPayload) => shiftApi.create(payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SHIFT_KEYS.lists() });
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

export function useUpdateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateShiftPayload;
    }) => shiftApi.update(id, payload),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SHIFT_KEYS.all });
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

export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shiftApi.delete(id),
    onSuccess: (result) => {
      if (result.isSuccess) {
        qc.invalidateQueries({ queryKey: SHIFT_KEYS.all });
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
