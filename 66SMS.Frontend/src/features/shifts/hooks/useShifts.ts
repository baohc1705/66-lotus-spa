import { shiftApi } from "@/features/shifts/api/shift.api";
import type { PageRequest } from "@/shared/types/common.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateShiftPayload,
  UpdateShiftPayload,
} from "../types/shift.types";

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
        toast.success("Tạo ca làm việc thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi tạo ca làm việc");
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
        toast.success("Cập nhật ca làm việc thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật ca làm việc");
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
        toast.success("Xóa ca làm việc thành công");
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa ca làm việc");
    },
  });
}
